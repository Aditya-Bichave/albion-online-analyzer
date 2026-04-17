const { app, BrowserWindow } = require('electron');
const http = require('http');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { createLogger } = require('./logging/logger');
const { initializeLoggingSession } = require('./logging/runtime');

let mainWindow;
let backendProcess;
let frontendProcess;
let servicesStarted = false;
let isQuitting = false;
let loggingSession = null;
let logger = null;

const FRONTEND_URL = 'http://127.0.0.1:5173';
const FRONTEND_HEALTHCHECK_URL = 'http://127.0.0.1:5173';
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

function startServices() {
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

    // Start Frontend (Vite)
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

function waitForFrontendReady(timeoutMs = FRONTEND_READY_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const deadline = Date.now() + timeoutMs;

        const attempt = () => {
            if (isQuitting) {
                reject(new Error('Application is shutting down.'));
                return;
            }

            const request = http.get(FRONTEND_HEALTHCHECK_URL, (response) => {
                response.resume();

                if (response.statusCode && response.statusCode < 500) {
                    resolve();
                    return;
                }

                scheduleRetry(new Error(`Frontend responded with status ${response.statusCode}.`));
            });

            request.setTimeout(1000, () => {
                request.destroy(new Error('Frontend readiness check timed out.'));
            });

            request.on('error', scheduleRetry);
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
    stopChildProcess(frontendProcess);
    stopChildProcess(backendProcess);
    frontendProcess = null;
    backendProcess = null;
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
        startServices();
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
