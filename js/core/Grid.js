export class Grid {
    constructor(map, cellSizeMeters = 30) {
        this.map = map;
        this.cellSizeMeters = cellSizeMeters;
        this.cells = new Map();
        // LOCK the grid origin to the initial center so it stays ANCHORED
        this.origin = map.getCenter();
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

    getBrushCells(centerX, centerY, radius = 1) {
        const cells = [];
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                cells.push({ x, y });
            }
        }
        return cells;
    }

    getCell(x, y) {
        const key = `${x},${y}`;
        if (!this.cells.has(key)) this.cells.set(key, { owner: null });
        return this.cells.get(key);
    }

    setOwner(x, y, ownerId) {
        const key = `${x},${y}`;
        this.cells.set(key, { owner: ownerId });
    }

    isValidStart(x, y, ownerId) {
        const cell = this.getCell(x, y);
        if (cell.owner === ownerId) return true;
        const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
        return neighbors.some(([nx, ny]) => this.getCell(nx, ny).owner === ownerId);
    }
}
