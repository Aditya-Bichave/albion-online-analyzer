export const MAP_VIEW_CALIBRATION = Object.freeze({
    defaultMapSize: 1000,
    baseReferenceMapSize: 1000,
    baseVminScale: 0.09,
    minZoom: 0.35,
    maxZoom: 2.5,
    zoomStep: 1.25,
    radarRingSizes: [14, 26, 38],
});

export function getMapCalibration(zoneInfo) {
    const parsedMapSize = Number.parseFloat(zoneInfo?.mapSize);
    const mapSize = Number.isFinite(parsedMapSize) && parsedMapSize > 0
        ? parsedMapSize
        : MAP_VIEW_CALIBRATION.defaultMapSize;

    return {
        mapSize,
        radarRingSizes: MAP_VIEW_CALIBRATION.radarRingSizes,
        scaleAtZoomOne: MAP_VIEW_CALIBRATION.baseVminScale
            * (MAP_VIEW_CALIBRATION.baseReferenceMapSize / mapSize),
        zoom: {
            min: MAP_VIEW_CALIBRATION.minZoom,
            max: MAP_VIEW_CALIBRATION.maxZoom,
            step: MAP_VIEW_CALIBRATION.zoomStep,
        }
    };
}
