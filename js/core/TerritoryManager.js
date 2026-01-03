export class TerritoryManager {
    constructor(grid) {
        this.grid = grid;
    }

    initializeTerritory(x, y, ownerId, size = 7) {
        const half = Math.floor(size / 2);
        for (let dx = -half; dx <= half; dx++) {
            for (let dy = -half; dy <= half; dy++) {
                this.grid.setOwner(x + dx, y + dy, ownerId);
            }
        }
    }

    captureTerritory(trail, ownerId) {
        if (trail.length < 3) return false;
        const enclosed = this.findEnclosedArea(trail, ownerId);
        enclosed.forEach(({x, y}) => {
            this.grid.setOwner(x, y, ownerId);
        });
        return enclosed.length > 0;
    }

    findEnclosedArea(trail, ownerId) {
        const trailSet = new Set(trail.map(p => `${p.x},${p.y}`));
        const ownedCells = this.grid.getOwnedCells(ownerId);
        const ownedSet = new Set(ownedCells.map(p => `${p.x},${p.y}`));
        
        const xs = trail.map(p => p.x);
        const ys = trail.map(p => p.y);
        const minX = Math.min(...xs) - 1;
        const maxX = Math.max(...xs) + 1;
        const minY = Math.min(...ys) - 1;
        const maxY = Math.max(...ys) + 1;

        const outside = new Set();
        const queue = [{x: minX, y: minY}];
        const visited = new Set([`${minX},${minY}`]);

        while (queue.length > 0) {
            const {x, y} = queue.shift();
            outside.add(`${x},${y}`);

            const neighbors = [
                {x: x-1, y}, {x: x+1, y}, {x, y: y-1}, {x, y: y+1}
            ];

            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (n.x < minX || n.x > maxX || n.y < minY || n.y > maxY) continue;
                if (visited.has(key)) continue;
                if (trailSet.has(key) || ownedSet.has(key)) continue;

                visited.add(key);
                queue.push(n);
            }
        }

        const enclosed = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const key = `${x},${y}`;
                if (!outside.has(key) && !ownedSet.has(key) && !trailSet.has(key)) {
                    const cell = this.grid.getCell(x, y);
                    if (cell.owner !== ownerId) {
                        enclosed.push({x, y});
                    }
                }
            }
        }

        return enclosed;
    }

    checkTrailCollision(trail, ownerId, otherTrails) {
        for (const point of trail) {
            const cell = this.grid.getCell(point.x, point.y);
            if (cell.owner !== null && cell.owner !== ownerId) {
                return true;
            }
            for (const [enemyId, enemyTrail] of otherTrails) {
                if (enemyId !== ownerId) {
                    if (enemyTrail.some(p => p.x === point.x && p.y === point.y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getTerritorySize(ownerId) {
        let count = 0;
        this.grid.cells.forEach(cell => {
            if (cell.owner === ownerId) count++;
        });
        return count;
    }

    getTotalCells() {
        return this.grid.cells.size;
    }

    isValidStart(x, y, ownerId) {
        const cell = this.grid.getCell(x, y);
        return cell.owner === ownerId;
    }
}
