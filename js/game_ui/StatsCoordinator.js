import { DOMUpdater } from './DOMUpdater.js';

export class StatsCoordinator {
    constructor(player, territoryManager) {
        this.player = player;
        this.territoryManager = territoryManager;
        this.domUpdater = new DOMUpdater();
        this.updateInterval = null;
    }

    start(intervalMs = 100) {
        this.update();
        this.updateInterval = setInterval(() => this.update(), intervalMs);
    }

    update() {
        const balance = this.player.balance || 0;
        const territory = this.territoryManager.getTerritorySize(this.player.id);
        const status = this.player.isExpanding() ? 'EXPANDING' : 'READY';

        this.domUpdater.updateBalance(balance);
        this.domUpdater.updateTerritory(territory);
        this.domUpdater.updateStatus(status);
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}
