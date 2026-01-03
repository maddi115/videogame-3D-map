export class GameStateOrchestrator {
    constructor(territoryManager, player, bots, grid) {
        this.territoryManager = territoryManager;
        this.player = player;
        this.bots = bots;
        this.grid = grid;
    }

    // The "Pulse" of the game: processes movement and territory capture
    startHeartbeat(ms = 100) {
        setInterval(() => {
            this.updateBots();
            this.processTrailConversion(this.player);
        }, ms);
    }

    updateBots() {
        this.bots.forEach(bot => {
            bot.update(this.grid, this.territoryManager);
            this.processTrailConversion(bot);
        });
    }

    processTrailConversion(entity) {
        // If entity is no longer expanding but has a trail, solidify it
        if (!entity.isExpanding() && entity.getTrail().length > 0) {
            const finalTrail = entity.endExpansion();
            this.territoryManager.captureTerritory(finalTrail, entity.id);
        }
    }
}
