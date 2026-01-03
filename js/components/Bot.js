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
            const brush = grid.getBrushCells(this.currentPos.x, this.currentPos.y, 1);
            this.expanding = true;
            this.trailArray = [...brush];
        }
        if (this.expanding) {
            const directions = [[1,0], [-1,0], [0,1], [0,-1]];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            this.currentPos.x += dir[0];
            this.currentPos.y += dir[1];
            const brush = grid.getBrushCells(this.currentPos.x, this.currentPos.y, 1);
            brush.forEach(cell => {
                if (!this.trailArray.some(t => t.x === cell.x && t.y === cell.y)) {
                    this.trailArray.push(cell);
                }
            });
            if (this.trailArray.length > 50) {
                this.expanding = false;
            }
        }
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
