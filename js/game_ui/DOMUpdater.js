export class DOMUpdater {
    constructor() {
        this.balanceEl = document.getElementById('balance');
        this.territoryEl = document.getElementById('territory');
        this.statusEl = document.getElementById('status');
    }

    updateBalance(value) {
        if (this.balanceEl) {
            this.balanceEl.textContent = `Balance: ${Math.floor(value)}`;
        }
    }

    updateTerritory(value) {
        if (this.territoryEl) {
            this.territoryEl.textContent = `Territory: ${value}`;
        }
    }

    updateStatus(value) {
        if (this.statusEl) {
            this.statusEl.textContent = `Status: ${value}`;
        }
    }
}
