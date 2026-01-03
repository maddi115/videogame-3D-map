export class Player {
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
    }

    startExpansion(x, y) {
        this.expanding = true;
        this.trail = [{ x, y }];
        this.currentPos = { x, y };
    }

    continueExpansion(x, y) {
        if (!this.expanding) return;
        const last = this.trail[this.trail.length - 1];
        if (last.x !== x || last.y !== y) {
            this.trail.push({ x, y });
            this.currentPos = { x, y };
        }
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
