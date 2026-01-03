export class DisabledButtons {
    constructor(map) {
        this.map = map;
        this.canvas = map.getCanvas();
        this.lockLeftClick();
    }

    lockLeftClick() {
        // Master Interceptor: Stops the map from ever seeing a left-click as a 'drag' start
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // This stops the event from bubbling up to MapLibre's navigation handlers
                // but still allows it for our own game logic listeners
                e.stopImmediatePropagation();
            }
        }, true); // The 'true' here is the secret—it uses the Capture Phase

        // Disable Context Menu so right-click panning is smooth
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Explicitly disable the map's default left-click drag handler
        if (this.map.dragPan) {
            this.map.dragPan.disable();
        }
        
        // Re-enable panning ONLY for right-click
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                this.map.dragPan.enable();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.map.dragPan.disable();
            }
        });
    }
}
