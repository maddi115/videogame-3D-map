export class InputHandler {
    constructor(map, grid, player, territoryManager) {
        this.map = map;
        this.grid = grid;
        this.player = player;
        this.territoryManager = territoryManager;
        this.mouseDown = false;
        this.lastGridPos = null;
        this.setupListeners();
    }

    setupListeners() {
        const canvas = this.map.getCanvas();
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    onMouseDown(e) {
        if (e.button !== 0) return; // Only left click for expansion
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const pos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (this.grid.isValidStart(pos.x, pos.y, this.player.id)) {
            this.mouseDown = true;
            this.lastGridPos = pos;
            const brush = this.grid.getBrushCells(pos.x, pos.y, 2); // 3x3 Brush
            this.player.startExpansion(brush);
        }
    }

    onMouseMove(e) {
        if (!this.mouseDown || !this.player.isExpanding()) return;
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const pos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (this.lastGridPos && (pos.x !== this.lastGridPos.x || pos.y !== this.lastGridPos.y)) {
            // INTERPOLATION: Fill gaps if mouse moves fast
            const dist = Math.max(Math.abs(pos.x - this.lastGridPos.x), Math.abs(pos.y - this.lastGridPos.y));
            for (let i = 1; i <= dist; i++) {
                const interX = Math.round(this.lastGridPos.x + (pos.x - this.lastGridPos.x) * (i / dist));
                const interY = Math.round(this.lastGridPos.y + (pos.y - this.lastGridPos.y) * (i / dist));
                const brush = this.grid.getBrushCells(interX, interY, 2);
                this.player.addCellsToTrail(brush);
            }
            this.lastGridPos = pos;
        }
    }

    onMouseUp(e) {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        if (this.player.isExpanding()) {
            const trail = this.player.endExpansion();
            if (trail.length > 0) {
                const last = trail[trail.length - 1];
                if (this.grid.isValidStart(last.x, last.y, this.player.id)) {
                    this.territoryManager.captureTerritory(trail, this.player.id);
                }
            }
        }
        this.lastGridPos = null;
    }
}
