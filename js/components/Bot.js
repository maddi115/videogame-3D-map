import { BalanceManager } from '../economics/BalanceManager.js';

export class Bot {
    constructor(id, name, color, startX, startY) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.expanding = false;
        this.trailArray = [];
        this.currentPos = { x: startX, y: startY };
        this.balance = 100;
        this.alive = true;
    }

    update(grid, territoryManager) {
        if (!this.expanding && Math.random() < 0.05) {
            this.performBlobExpansion(grid, territoryManager);
        }
    }

    performBlobExpansion(grid, territoryManager) {
        const bounds = this.getTerritoryBounds(grid);
        if (!bounds) return;

        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];

        const newCells = this.expandBlobSmooth(grid, dir, 2);
        const cost = territoryManager.calculateCaptureCost(newCells, this.id);

        if (BalanceManager.validateAffordable(this, cost) && newCells.length > 0) {
            territoryManager.captureTerritory(newCells, this.id);
            BalanceManager.deductExpansionCost(this, cost);
        }
    }

    getTerritoryBounds(grid) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let found = false;

        grid.cells.forEach((cell, key) => {
            if (cell.owner === this.id) {
                const [x, y] = key.split(',').map(Number);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                found = true;
            }
        });

        return found ? { minX, maxX, minY, maxY } : null;
    }

    expandBlobSmooth(grid, dir, layers) {
        const newCells = [];
        const cellSet = new Set();

        grid.cells.forEach((cell, key) => {
            if (cell.owner === this.id) {
                const [x, y] = key.split(',').map(Number);

                for (let depth = 1; depth <= layers; depth++) {
                    for (let spread = -1; spread <= 1; spread++) {
                        let newX, newY;

                        if (dir.x !== 0) {
                            newX = x + (dir.x * depth);
                            newY = y + spread;
                        } else {
                            newX = x + spread;
                            newY = y + (dir.y * depth);
                        }

                        const targetCell = grid.getCell(newX, newY);
                        const cellKey = `${newX},${newY}`;

                        if ((targetCell.owner === null || targetCell.owner === this.id) && !cellSet.has(cellKey)) {
                            cellSet.add(cellKey);
                            newCells.push({ x: newX, y: newY });
                        }
                    }
                }
            }
        });

        return newCells;
    }

    getTrail() { return this.trailArray; }
    isExpanding() { return this.expanding; }
    endExpansion() {
        const t = [...this.trailArray];
        this.trailArray = [];
        this.expanding = false;
        return t;
    }
}
