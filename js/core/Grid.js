export class Grid {
    constructor(map, cellSizeMeters = 30) {
        this.map = map;
        this.cellSizeMeters = cellSizeMeters;
        this.cells = new Map();
    }

    lngLatToGrid(lng, lat) {
        const metersPerDegree = 111320;
        const centerLng = this.map.getCenter().lng;
        const centerLat = this.map.getCenter().lat;
        
        const x = Math.floor(((lng - centerLng) * metersPerDegree * Math.cos(centerLat * Math.PI / 180)) / this.cellSizeMeters);
        const y = Math.floor(((lat - centerLat) * metersPerDegree) / this.cellSizeMeters);
        
        return { x, y };
    }

    gridToLngLat(x, y) {
        const metersPerDegree = 111320;
        const centerLng = this.map.getCenter().lng;
        const centerLat = this.map.getCenter().lat;
        
        const lng = centerLng + (x * this.cellSizeMeters) / (metersPerDegree * Math.cos(centerLat * Math.PI / 180));
        const lat = centerLat + (y * this.cellSizeMeters) / metersPerDegree;
        
        return { lng, lat };
    }

    getCellKey(x, y) {
        return `${x},${y}`;
    }

    getCell(x, y) {
        const key = this.getCellKey(x, y);
        if (!this.cells.has(key)) {
            this.cells.set(key, { owner: null, balance: 0 });
        }
        return this.cells.get(key);
    }

    setOwner(x, y, ownerId) {
        const cell = this.getCell(x, y);
        cell.owner = ownerId;
    }

    getVisibleCells() {
        const bounds = this.map.getBounds();
        const sw = this.lngLatToGrid(bounds.getWest(), bounds.getSouth());
        const ne = this.lngLatToGrid(bounds.getEast(), bounds.getNorth());
        
        const visible = [];
        for (let x = sw.x - 2; x <= ne.x + 2; x++) {
            for (let y = sw.y - 2; y <= ne.y + 2; y++) {
                const cell = this.getCell(x, y);
                if (cell.owner !== null) {
                    visible.push({ x, y, ...cell });
                }
            }
        }
        return visible;
    }

    getOwnedCells(ownerId) {
        const owned = [];
        this.cells.forEach((cell, key) => {
            if (cell.owner === ownerId) {
                const [x, y] = key.split(',').map(Number);
                owned.push({ x, y });
            }
        });
        return owned;
    }

    isAdjacentToOwned(x, y, ownerId) {
        const neighbors = [
            [x-1, y], [x+1, y], [x, y-1], [x, y+1]
        ];
        return neighbors.some(([nx, ny]) => {
            const cell = this.getCell(nx, ny);
            return cell.owner === ownerId;
        });
    }
}
