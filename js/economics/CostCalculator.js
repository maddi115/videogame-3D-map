import { ECONOMIC_CONFIG } from './EconomicConfig.js';

export class CostCalculator {
    static calculateEmptyLandCost(cellCount) {
        return cellCount * ECONOMIC_CONFIG.EMPTY_LAND_BASE_COST;
    }

    static calculateEnemyTerritoryCost(cellCount, defenderBalance) {
        const costPerCell = ECONOMIC_CONFIG.ENEMY_TERRITORY_BASE_COST + 
                           (defenderBalance / ECONOMIC_CONFIG.DEFENSE_SCALING_FACTOR);
        return cellCount * costPerCell;
    }

    static calculateTotalCaptureCost(cells, attackerId, grid, allEntities) {
        let emptyCells = 0;
        const enemyCells = new Map(); // ownerId -> count

        cells.forEach(pos => {
            const cell = grid.getCell(pos.x, pos.y);
            
            if (cell.owner === null) {
                emptyCells++;
            } else if (cell.owner !== attackerId) {
                const count = enemyCells.get(cell.owner) || 0;
                enemyCells.set(cell.owner, count + 1);
            }
            // Own territory costs nothing
        });

        let totalCost = this.calculateEmptyLandCost(emptyCells);

        enemyCells.forEach((count, defenderId) => {
            const defender = allEntities.find(e => e.id === defenderId);
            const defenderBalance = defender ? defender.balance : 100;
            totalCost += this.calculateEnemyTerritoryCost(count, defenderBalance);
        });

        return Math.floor(totalCost);
    }
}
