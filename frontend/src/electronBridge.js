const electronModule = typeof window !== 'undefined' && typeof window.require === 'function'
    ? window.require('electron')
    : null;

const ipcRenderer = electronModule?.ipcRenderer ?? null;

function invoke(channel, payload) {
    if (!ipcRenderer) {
        return Promise.resolve(null);
    }

    return ipcRenderer.invoke(channel, payload);
}

export function isElectronRuntime() {
    return Boolean(ipcRenderer);
}

export function getOverlayState() {
    return invoke('overlay:get-state');
}

export function openOverlay(payload = {}) {
    return invoke('overlay:open', payload);
}

export function closeOverlay() {
    return invoke('overlay:close');
}

export function updateOverlaySettings(payload = {}) {
    return invoke('overlay:update-settings', payload);
}
