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
        canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    onDoubleClick(e) {
        e.preventDefault();
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const clickPos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        const bounds = this.getTerritoryBounds();
        if (!bounds) return;

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        const dx = clickPos.x - centerX;
        const dy = clickPos.y - centerY;
        
        let dir = { x: 0, y: 0 };
        if (Math.abs(dx) > Math.abs(dy)) {
            dir.x = dx > 0 ? 1 : -1;
        } else {
            dir.y = dy > 0 ? 1 : -1;
        }

        // Expand entire blob with smoothing
        const newCells = this.expandBlobSmooth(dir, 2);
        const cost = this.territoryManager.calculateCaptureCost(newCells, this.player.id);
        
        if (this.player.balance >= cost) {
            this.territoryManager.captureTerritory(newCells, this.player.id);
            this.player.balance -= cost;
        }
    }

    expandBlobSmooth(dir, layers) {
        const newCells = [];
        const cellSet = new Set();

        // For each owned cell, expand it in the direction
        this.grid.cells.forEach((cell, key) => {
            if (cell.owner === this.player.id) {
                const [x, y] = key.split(',').map(Number);
                
                // Expand in direction with a small spread perpendicular
                for (let depth = 1; depth <= layers; depth++) {
                    for (let spread = -1; spread <= 1; spread++) {
                        let newX, newY;
                        
                        if (dir.x !== 0) {
                            // Horizontal expansion
                            newX = x + (dir.x * depth);
                            newY = y + spread;
                        } else {
                            // Vertical expansion
                            newX = x + spread;
                            newY = y + (dir.y * depth);
                        }
                        
                        const targetCell = this.grid.getCell(newX, newY);
                        const cellKey = `${newX},${newY}`;
                        
                        if ((targetCell.owner === null || targetCell.owner === this.player.id) && !cellSet.has(cellKey)) {
                            cellSet.add(cellKey);
                            newCells.push({ x: newX, y: newY });
                        }
                    }
                }
            }
        });

        return newCells;
    }

    getTerritoryBounds() {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let found = false;

        this.grid.cells.forEach((cell, key) => {
            if (cell.owner === this.player.id) {
                const [x, y] = key.split(',').map(Number);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                found = true;
            }
        });

        return found ? { minX, maxX, minY, maxY } : null;
    }

    onMouseDown(e) {
        if (e.button !== 0) return;
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const pos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (this.grid.isValidStart(pos.x, pos.y, this.player.id)) {
            this.mouseDown = true;
            this.lastGridPos = pos;
            const brush = this.grid.getBrushCells(pos.x, pos.y, 2);
            this.player.startExpansion(brush);
        }
    }

    onMouseMove(e) {
        if (!this.mouseDown || !this.player.isExpanding()) return;
        const lngLat = this.map.unproject([e.clientX, e.clientY]);
        const pos = this.grid.lngLatToGrid(lngLat.lng, lngLat.lat);

        if (this.lastGridPos && (pos.x !== this.lastGridPos.x || pos.y !== this.lastGridPos.y)) {
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
                    const cost = this.territoryManager.calculateCaptureCost(trail, this.player.id);
                    if (this.player.balance >= cost) {
                        this.territoryManager.captureTerritory(trail, this.player.id);
                        this.player.balance -= cost;
                    }
                }
            }
        }
        this.lastGridPos = null;
    }
}
