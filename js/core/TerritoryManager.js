export class TerritoryManager {
    constructor(grid) {
        this.grid = grid;
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

    captureTerritory(trail, ownerId) {
        // Commits the entire bulky trail to the grid
        trail.forEach(pos => {
            this.grid.setOwner(pos.x, pos.y, ownerId);
        });
    }
}
