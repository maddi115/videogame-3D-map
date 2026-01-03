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
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
    }

    onMouseDown(e) {
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const gridPos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (this.territoryManager.isValidStart(gridPos.x, gridPos.y, this.player.id)) {
            this.mouseDown = true;
            this.player.startExpansion(gridPos.x, gridPos.y);
            this.lastGridPos = gridPos;
            this.map.dragPan.disable();
        }
    }

    onMouseMove(e) {
        if (!this.mouseDown || !this.player.isExpanding()) return;

        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const gridPos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (!this.lastGridPos || gridPos.x !== this.lastGridPos.x || gridPos.y !== this.lastGridPos.y) {
            this.player.continueExpansion(gridPos.x, gridPos.y);
            this.lastGridPos = gridPos;
        }
    }

    onMouseUp(e) {
        if (!this.mouseDown) return;

        this.mouseDown = false;
        this.map.dragPan.enable();

        if (this.player.isExpanding()) {
            const trail = this.player.endExpansion();
            const endPos = trail[trail.length - 1];
            if (this.territoryManager.isValidStart(endPos.x, endPos.y, this.player.id)) {
                this.territoryManager.captureTerritory(trail, this.player.id);
            }
        }

        this.lastGridPos = null;
    }
}
