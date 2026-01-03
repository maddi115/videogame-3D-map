import { GridCoordinates } from './GridCoordinates.js';
import { CellManager } from './CellManager.js';
import { ExpansionValidator } from './ExpansionValidator.js';

export class Grid {
    constructor(map, cellSizeMeters = 30) {
        this.map = map;
        this.cellSizeMeters = cellSizeMeters;
        this.origin = map.getCenter();
        
        this.coordinates = new GridCoordinates(map, cellSizeMeters, this.origin);
        this.cellManager = new CellManager();
        this.validator = new ExpansionValidator(this.cellManager);
    }

    // Coordinate conversion delegates
    lngLatToGrid(lng, lat) {
        return this.coordinates.lngLatToGrid(lng, lat);
    }

    gridToLngLat(x, y) {
        return this.coordinates.gridToLngLat(x, y);
    }

    // Cell management delegates
    getCell(x, y) {
        return this.cellManager.getCell(x, y);
    }

    setOwner(x, y, ownerId) {
        this.cellManager.setOwner(x, y, ownerId);
    }

    get cells() {
        return this.cellManager.getAllCells();
    }

    // Validation delegates
    getBrushCells(centerX, centerY, radius = 1) {
        return this.validator.getBrushCells(centerX, centerY, radius);
    }

    isValidStart(x, y, ownerId) {
        return this.validator.isValidStart(x, y, ownerId);
    }
}
