export class Bot {
    constructor(id, name, color, startX, startY) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.balance = 100;
        this.alive = true;
        this.expanding = false;
        this.trail = [];
        this.startPos = { x: startX, y: startY };
        this.currentPos = { x: startX, y: startY };
        this.targetLength = 0;
        this.expansionCooldown = 0;
    }

    update(grid, territoryManager) {
        if (!this.alive) return;

        if (this.expansionCooldown > 0) {
            this.expansionCooldown--;
            return;
        }

        if (!this.expanding) {
            this.startNewExpansion(grid);
        } else {
            this.continueCurrentExpansion(grid, territoryManager);
        }
    }

    startNewExpansion(grid) {
        const ownedCells = grid.getOwnedCells(this.id);
        if (ownedCells.length === 0) return;

        const borderCells = ownedCells.filter(cell => {
            const neighbors = [
                [cell.x-1, cell.y], [cell.x+1, cell.y],
                [cell.x, cell.y-1], [cell.x, cell.y+1]
            ];
            return neighbors.some(([nx, ny]) => {
                const neighborCell = grid.getCell(nx, ny);
                return neighborCell.owner !== this.id;
            });
        });

        if (borderCells.length === 0) return;

        const start = borderCells[Math.floor(Math.random() * borderCells.length)];
        this.expanding = true;
        this.trail = [{ x: start.x, y: start.y }];
        this.currentPos = { x: start.x, y: start.y };
        this.targetLength = Math.floor(Math.random() * 15) + 5;
        this.direction = this.pickRandomDirection();
    }

    continueCurrentExpansion(grid, territoryManager) {
        if (this.trail.length >= this.targetLength || Math.random() < 0.1) {
            const ownedCells = grid.getOwnedCells(this.id);
            const closestOwned = this.findClosestCell(this.currentPos, ownedCells);
            
            if (closestOwned && this.isAdjacent(this.currentPos, closestOwned)) {
                this.endExpansion();
                this.expansionCooldown = Math.floor(Math.random() * 20) + 10;
                return;
            }
        }

        const next = this.getNextCell(this.currentPos, this.direction);
        const cell = grid.getCell(next.x, next.y);
        if (cell.owner !== null && cell.owner !== this.id) {
            this.trail = [];
            this.expanding = false;
            this.expansionCooldown = 30;
            return;
        }

        if (Math.random() < 0.15) {
            this.direction = this.pickRandomDirection();
        }

        this.trail.push(next);
        this.currentPos = next;
    }

    pickRandomDirection() {
        const dirs = ['north', 'south', 'east', 'west'];
        return dirs[Math.floor(Math.random() * dirs.length)];
    }

    getNextCell(pos, direction) {
        switch(direction) {
            case 'north': return { x: pos.x, y: pos.y + 1 };
            case 'south': return { x: pos.x, y: pos.y - 1 };
            case 'east': return { x: pos.x + 1, y: pos.y };
            case 'west': return { x: pos.x - 1, y: pos.y };
            default: return pos;
        }
    }

    findClosestCell(from, cells) {
        if (cells.length === 0) return null;
        let closest = cells[0];
        let minDist = this.distance(from, closest);
        for (const cell of cells) {
            const dist = this.distance(from, cell);
            if (dist < minDist) {
                minDist = dist;
                closest = cell;
            }
        }
        return closest;
    }

    distance(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isAdjacent(a, b) {
        return this.distance(a, b) === 1;
    }

    endExpansion() {
        this.expanding = false;
        const trail = [...this.trail];
        this.trail = [];
        return trail;
    }

    die() {
        this.alive = false;
        this.expanding = false;
        this.trail = [];
    }

    getTrail() {
        return this.trail;
    }

    isExpanding() {
        return this.expanding;
    }
}
