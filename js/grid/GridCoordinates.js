export class GridCoordinates {
    constructor(map, cellSizeMeters, origin) {
        this.map = map;
        this.cellSizeMeters = cellSizeMeters;
        this.origin = origin;
    }

    lngLatToGrid(lng, lat) {
        const metersPerDegree = 111320;
        const latRad = this.origin.lat * Math.PI / 180;
        const x = Math.floor(((lng - this.origin.lng) * metersPerDegree * Math.cos(latRad)) / this.cellSizeMeters);
        const y = Math.floor(((lat - this.origin.lat) * metersPerDegree) / this.cellSizeMeters);
        return { x, y };
    }

    gridToLngLat(x, y) {
        const metersPerDegree = 111320;
        const latRad = this.origin.lat * Math.PI / 180;
        const lng = this.origin.lng + (x * this.cellSizeMeters) / (metersPerDegree * Math.cos(latRad));
        const lat = this.origin.lat + (y * this.cellSizeMeters) / metersPerDegree;
        return { lng, lat };
    }
}
