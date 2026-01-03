export class GameLoop {
    constructor(territoryManager, players, bots) {
        this.territoryManager = territoryManager;
        this.players = players;
        this.bots = bots;
        this.tickCount = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        this.lastTick = performance.now();
        this.tick();
    }

    tick() {
        if (!this.running) return;

        const now = performance.now();
        const delta = now - this.lastTick;

        if (delta >= 500) {
            this.tickCount++;
            this.lastTick = now;

            [...this.players, ...this.bots].forEach(entity => {
                if (entity.alive) {
                    const interestRate = this.calculateInterest(entity);
                    entity.balance += entity.balance * interestRate;
                }
            });

            if (this.tickCount % 10 === 0) {
                [...this.players, ...this.bots].forEach(entity => {
                    if (entity.alive) {
                        const territorySize = this.territoryManager.getTerritorySize(entity.id);
                        entity.balance += territorySize * 0.5;
                    }
                });
            }

            if (this.tickCount % 20 === 0) {
                this.checkWinCondition();
            }
        }

        requestAnimationFrame(() => this.tick());
    }

    calculateInterest(entity) {
        let baseInterest = Math.max(0.01, 0.07 - (this.tickCount / 100) * 0.06);
        const territorySize = this.territoryManager.getTerritorySize(entity.id);
        const bonus = Math.min(0.02, territorySize / 10000);
        return baseInterest + bonus;
    }

    checkWinCondition() {
        const totalCells = this.territoryManager.getTotalCells();
        [...this.players, ...this.bots].forEach(entity => {
            if (entity.alive) {
                const owned = this.territoryManager.getTerritorySize(entity.id);
                const percentage = (owned / totalCells) * 100;
                if (percentage >= 99.99) {
                    this.endGame(entity);
                }
            }
        });
    }

    endGame(winner) {
        this.running = false;
        console.log(`${winner.name} wins with ${this.territoryManager.getTerritorySize(winner.id)} territory!`);
        alert(`${winner.name} WINS!`);
    }

    stop() {
        this.running = false;
    }
}
