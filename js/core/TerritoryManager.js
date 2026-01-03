import { CostCalculator } from '../economics/CostCalculator.js';

export class TerritoryManager {
    constructor(grid) {
        this.grid = grid;
        this.allEntities = []; // Will be set from outside
    }

    setEntities(entities) {
        this.allEntities = entities;
    }

    initializeTerritory(centerX, centerY, ownerId, radius = 5) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                this.grid.setOwner(x, y, ownerId);
            }
        }
    }

    isValidStart(x, y, ownerId) {
        return this.grid.isValidStart(x, y, ownerId);
    }

    calculateCaptureCost(trail, attackerId) {
        return CostCalculator.calculateTotalCaptureCost(trail, attackerId, this.grid, this.allEntities);
    }

    captureTerritory(trail, ownerId) {
        trail.forEach(pos => {
            this.grid.setOwner(pos.x, pos.y, ownerId);
        });
    }

    getTerritorySize(ownerId) {
        let count = 0;
        this.grid.cells.forEach(cell => {
            if (cell.owner === ownerId) count++;
        });
        return count;
    }

    getTotalCells() {
        let count = 0;
        this.grid.cells.forEach(cell => {
            if (cell.owner !== null) count++;
        });
        return count;
    }
}
