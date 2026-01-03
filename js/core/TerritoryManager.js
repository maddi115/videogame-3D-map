export class TerritoryManager {
    constructor(grid) {
        this.grid = grid;
        this.EMPTY_COST = 2;
        this.ENEMY_COST = 10;
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

    calculateCaptureCost(trail, ownerId) {
        let cost = 0;
        trail.forEach(pos => {
            const cell = this.grid.getCell(pos.x, pos.y);
            if (cell.owner === null) {
                cost += this.EMPTY_COST;
            } else if (cell.owner !== ownerId) {
                cost += this.ENEMY_COST;
            }
            // Own territory costs nothing
        });
        return cost;
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
