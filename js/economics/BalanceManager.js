export class BalanceManager {
    static validateAffordable(entity, cost) {
        return entity.balance >= cost;
    }

    static deductExpansionCost(entity, cost) {
        if (this.validateAffordable(entity, cost)) {
            entity.balance -= cost;
            return true;
        }
        return false;
    }

    static addBalance(entity, amount) {
        entity.balance += amount;
    }
}
