export class Player {
    constructor(id, name, color, startX, startY) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.expanding = false;
        this.trailSet = new Set();
        this.trailArray = [];
        this.balance = 100;
        this.alive = true;
    }

    startExpansion(cells) {
        this.expanding = true;
        this.trailSet.clear();
        this.addCellsToTrail(cells);
    }

    addCellsToTrail(cells) {
        cells.forEach(c => {
            const key = `${c.x},${c.y}`;
            if (!this.trailSet.has(key)) {
                this.trailSet.add(key);
                this.trailArray.push(c);
            }
        });
    }

    endExpansion() {
        this.expanding = false;
        const finalTrail = [...this.trailArray];
        this.trailArray = [];
        this.trailSet.clear();
        return finalTrail;
    }

    getTrail() { return this.trailArray; }
    isExpanding() { return this.expanding; }
}
