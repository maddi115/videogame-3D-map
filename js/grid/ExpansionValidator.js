export class ExpansionValidator {
    constructor(cellManager) {
        this.cellManager = cellManager;
    }

    getBrushCells(centerX, centerY, radius = 1) {
        const cells = [];
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                cells.push({ x, y });
            }
        }
        return cells;
    }

    isValidStart(x, y, ownerId) {
        const cell = this.cellManager.getCell(x, y);
        if (cell.owner === ownerId) return true;
        
        // Check within 4 cell radius for owned territory
        for (let dx = -4; dx <= 4; dx++) {
            for (let dy = -4; dy <= 4; dy++) {
                if (this.cellManager.getCell(x + dx, y + dy).owner === ownerId) {
                    return true;
                }
            }
        }
        return false;
    }
}
