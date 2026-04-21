const { app, BrowserWindow, ipcMain } = require('electron');
const http = require('http');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { createLogger } = require('./logging/logger');
const { initializeLoggingSession } = require('./logging/runtime');

let mainWindow;
let overlayWindow;
let backendProcess;
let frontendProcess;
let servicesStarted = false;
let isQuitting = false;
let loggingSession = null;
let logger = null;
let managesFrontendProcess = false;
let overlayState = {
    open: false,
    clickThrough: false,
    opacity: 0.92,
    alwaysOnTop: true,
    bounds: {
        width: 430,
        height: 430
    }
};

const FRONTEND_URL = 'http://127.0.0.1:5173';
const FRONTEND_HEALTHCHECK_URLS = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://[::1]:5173'
];
const FRONTEND_READY_TIMEOUT_MS = 30000;
const FRONTEND_READY_INTERVAL_MS = 500;
const FRONTEND_DEV_ARGS = ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'];

function getNpmCommand() {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function getNodeCommand() {
    return process.platform === 'win32' ? 'node.exe' : 'node';
}

function createWindow(url = FRONTEND_URL) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'Albion Resource Radar',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        backgroundColor: '#090a0d',
    });

    mainWindow.loadURL(url);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function buildOverlayUrl() {
    return `${FRONTEND_URL}?view=minimap`;
}

function applyOverlayWindowSettings() {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
        return;
    }

    overlayWindow.setOpacity(overlayState.opacity);
    overlayWindow.setAlwaysOnTop(Boolean(overlayState.alwaysOnTop), 'screen-saver');
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setIgnoreMouseEvents(Boolean(overlayState.clickThrough), { forward: true });
    overlayWindow.setFocusable(!overlayState.clickThrough);
    overlayWindow.setSkipTaskbar(true);
}

function syncOverlayBounds() {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
        return;
    }

    const bounds = overlayWindow.getBounds();
    overlayState.bounds = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
    };
}

function createOverlayWindow() {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.show();
        overlayWindow.focus();
        return overlayWindow;
    }

    const {
        x,
        y,
        width = 430,
        height = 430
    } = overlayState.bounds || {};

    overlayWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        minWidth: 260,
        minHeight: 260,
        frame: false,
        transparent: false,
        backgroundColor: '#090a0d',
        autoHideMenuBar: true,
        resizable: true,
        movable: true,
        maximizable: false,
        minimizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        show: false,
        title: 'Albion Radar Minimap',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    applyOverlayWindowSettings();
    overlayWindow.loadURL(buildOverlayUrl());

    overlayWindow.once('ready-to-show', () => {
        overlayState.open = true;
        overlayWindow.showInactive();
    });

    overlayWindow.on('move', syncOverlayBounds);
    overlayWindow.on('resize', syncOverlayBounds);
    overlayWindow.on('closed', () => {
        syncOverlayBounds();
        overlayState.open = false;
        overlayWindow = null;
    });

    return overlayWindow;
}

function closeOverlayWindow() {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
        overlayState.open = false;
        overlayWindow = null;
        return;
    }

    overlayWindow.close();
}

function probeFrontend(url) {
    return new Promise((resolve) => {
        const request = http.get(url, (response) => {
            response.resume();
            resolve(Boolean(response.statusCode && response.statusCode < 500));
        });

        request.setTimeout(1000, () => {
            request.destroy(new Error('Frontend probe timed out.'));
        });

        request.on('error', () => resolve(false));
    });
}

async function getReachableFrontendUrl() {
    for (const url of FRONTEND_HEALTHCHECK_URLS) {
        const isReachable = await probeFrontend(url);
        if (isReachable) {
            return url;
        }
    }

    return null;
}

async function startServices() {
    if (servicesStarted) {
        return;
    }

    const sharedEnv = {
        ...process.env,
        ...(loggingSession?.environment || {})
    };

    servicesStarted = true;
    logger?.info('starting_services', {
        sessionId: loggingSession?.sessionId,
        frontendUrl: FRONTEND_URL,
        logLevel: sharedEnv.LOG_LEVEL,
        packetVerbose: sharedEnv.LOG_PACKET_VERBOSE
    });

    // Start Backend
    backendProcess = spawn(getNodeCommand(), ['server.js'], {
        cwd: path.join(__dirname, 'backend'),
        env: sharedEnv,
        shell: false,
        stdio: 'inherit'
    });

    const existingFrontendUrl = await getReachableFrontendUrl();
    if (existingFrontendUrl) {
        managesFrontendProcess = false;
        frontendProcess = null;
        logger?.info('frontend_process_reused', {
            frontendUrl: existingFrontendUrl
        });
    } else {
        managesFrontendProcess = true;
        frontendProcess = process.platform === 'win32'
            ? spawn('cmd.exe', ['/d', '/s', '/c', `${getNpmCommand()} ${FRONTEND_DEV_ARGS.join(' ')}`], {
                cwd: path.join(__dirname, 'frontend'),
                env: {
                    ...sharedEnv,
                    VITE_LOG_LEVEL: sharedEnv.LOG_LEVEL,
                    VITE_LOG_UI_STREAM_LEVEL: sharedEnv.LOG_UI_STREAM_LEVEL
                },
                shell: false,
                stdio: 'inherit'
            })
            : spawn(getNpmCommand(), FRONTEND_DEV_ARGS, {
                cwd: path.join(__dirname, 'frontend'),
                env: {
                    ...sharedEnv,
                    VITE_LOG_LEVEL: sharedEnv.LOG_LEVEL,
                    VITE_LOG_UI_STREAM_LEVEL: sharedEnv.LOG_UI_STREAM_LEVEL
                },
                shell: false,
                stdio: 'inherit'
            });
    }

    backendProcess.on('error', (error) => {
        logger?.error('backend_process_error', {
            error,
            pid: backendProcess?.pid ?? null
        });
    });
    backendProcess.on('exit', (code, signal) => {
        logger?.warning('backend_process_exit', {
            code,
            signal,
            pid: backendProcess?.pid ?? null
        });
    });

    if (frontendProcess) {
        frontendProcess.on('error', (error) => {
            logger?.error('frontend_process_error', {
                error,
                pid: frontendProcess?.pid ?? null
            });
        });
        frontendProcess.on('exit', (code, signal) => {
            logger?.warning('frontend_process_exit', {
                code,
                signal,
                pid: frontendProcess?.pid ?? null
            });
        });
    }
}

function waitForFrontendReady(timeoutMs = FRONTEND_READY_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const deadline = Date.now() + timeoutMs;

        const attempt = () => {
            if (isQuitting) {
                reject(new Error('Application is shutting down.'));
                return;
            }

            getReachableFrontendUrl()
                .then((reachableUrl) => {
                    if (reachableUrl) {
                        logger?.debug('frontend_ready_probe_success', {
                            frontendUrl: reachableUrl
                        });
                        resolve();
                        return;
                    }

                    scheduleRetry(new Error('Frontend is not reachable yet.'));
                })
                .catch(scheduleRetry);
        };

        const scheduleRetry = (error) => {
            logger?.debug('frontend_readiness_retry', {
                error: error.message,
                remainingMs: Math.max(0, deadline - Date.now())
            });
            if (Date.now() >= deadline) {
                reject(error);
                return;
            }

            setTimeout(attempt, FRONTEND_READY_INTERVAL_MS);
        };

        attempt();
    });
}

function stopChildProcess(childProcess) {
    if (!childProcess || childProcess.killed) {
        return;
    }

    if (process.platform === 'win32') {
        execFile('taskkill', ['/pid', String(childProcess.pid), '/T', '/F'], () => {});
        return;
    }

    try {
        childProcess.kill('SIGTERM');
    } catch {
        // Ignore shutdown errors while the app is exiting.
    }
}

function stopServices() {
    closeOverlayWindow();
    if (managesFrontendProcess) {
        stopChildProcess(frontendProcess);
    }
    stopChildProcess(backendProcess);
    frontendProcess = null;
    backendProcess = null;
    managesFrontendProcess = false;
    servicesStarted = false;
}

app.on('ready', async () => {
    try {
        loggingSession = initializeLoggingSession(__dirname);
        logger = createLogger({
            processName: 'electron',
            rootDir: __dirname
        });
        logger.info('logging_session_initialized', loggingSession.metadata);
        await startServices();
        await waitForFrontendReady();
        if (!isQuitting) {
            logger.info('frontend_ready', { url: FRONTEND_URL });
            createWindow();
        }
    } catch (error) {
        logger?.error('frontend_ready_failed', { error });
        if (!isQuitting) {
            createWindow(`data:text/html;charset=utf-8,${encodeURIComponent(`
                <html>
                    <body style="margin:0;font-family:sans-serif;background:#090a0d;color:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                        <div style="max-width:520px;padding:24px;">
                            <h1 style="margin:0 0 12px;">Frontend failed to start</h1>
                            <p style="margin:0 0 8px;">Vite did not become reachable on ${FRONTEND_URL} within ${FRONTEND_READY_TIMEOUT_MS / 1000} seconds.</p>
                            <p style="margin:0;color:#a1a5b5;">Check the terminal output for the frontend process.</p>
                        </div>
                    </body>
                </html>
            `)}`);
        }
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    isQuitting = true;
    logger?.info('before_quit', { reason: 'app_before_quit' });
    stopServices();
});

app.on('quit', () => {
    logger?.info('quit', { reason: 'app_quit' });
    stopServices();
    logger?.close();
});

ipcMain.handle('overlay:get-state', () => {
    return {
        ...overlayState,
        open: Boolean(overlayWindow && !overlayWindow.isDestroyed())
    };
});

ipcMain.handle('overlay:open', async (_event, payload = {}) => {
    if (payload && typeof payload === 'object') {
        overlayState = {
            ...overlayState,
            ...('clickThrough' in payload ? { clickThrough: Boolean(payload.clickThrough) } : {}),
            ...('alwaysOnTop' in payload ? { alwaysOnTop: Boolean(payload.alwaysOnTop) } : {}),
            ...('opacity' in payload ? { opacity: Math.min(1, Math.max(0.35, Number(payload.opacity) || overlayState.opacity)) } : {})
        };
    }

    createOverlayWindow();
    applyOverlayWindowSettings();

    return {
        ...overlayState,
        open: true
    };
});

ipcMain.handle('overlay:close', () => {
    closeOverlayWindow();
    return {
        ...overlayState,
        open: false
    };
});

ipcMain.handle('overlay:update-settings', (_event, payload = {}) => {
    overlayState = {
        ...overlayState,
        ...('clickThrough' in payload ? { clickThrough: Boolean(payload.clickThrough) } : {}),
        ...('alwaysOnTop' in payload ? { alwaysOnTop: Boolean(payload.alwaysOnTop) } : {}),
        ...('opacity' in payload ? { opacity: Math.min(1, Math.max(0.35, Number(payload.opacity) || overlayState.opacity)) } : {})
    };

    applyOverlayWindowSettings();

    return {
        ...overlayState,
        open: Boolean(overlayWindow && !overlayWindow.isDestroyed())
    };
});
