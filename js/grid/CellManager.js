export class CellManager {
    constructor() {
        this.cells = new Map();
    }

    getCell(x, y) {
        const key = `${x},${y}`;
        if (!this.cells.has(key)) {
            this.cells.set(key, { owner: null });
        }
        return this.cells.get(key);
    }

    setOwner(x, y, ownerId) {
        const key = `${x},${y}`;
        this.cells.set(key, { owner: ownerId });
    }

    getAllCells() {
        return this.cells;
    }
}
