export class CameraControl {
    constructor(map) {
        this.map = map;
        this.keys = {};
        this.moveSpeed = 0.0001; // Adjusted for Mercator units
        this.rotateSpeed = 2.0;
        
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        
        this.startLoop();
    }

    startLoop() {
        const update = () => {
            if (Object.values(this.keys).some(v => v)) {
                const center = this.map.getCenter();
                const zoom = this.map.getZoom();
                const bearing = this.map.getBearing();
                
                // Adjust speed based on zoom level so it doesn't feel too fast/slow
                const adjustedSpeed = this.moveSpeed * Math.pow(2, 17 - zoom);
                
                let dx = 0;
                let dy = 0;

                if (this.keys['w']) {
                    dx += Math.sin(bearing * Math.PI / 180) * adjustedSpeed;
                    dy += Math.cos(bearing * Math.PI / 180) * adjustedSpeed;
                }
                if (this.keys['s']) {
                    dx -= Math.sin(bearing * Math.PI / 180) * adjustedSpeed;
                    dy -= Math.cos(bearing * Math.PI / 180) * adjustedSpeed;
                }
                if (this.keys['a']) {
                    dx -= Math.cos(bearing * Math.PI / 180) * adjustedSpeed;
                    dy += Math.sin(bearing * Math.PI / 180) * adjustedSpeed;
                }
                if (this.keys['d']) {
                    dx += Math.cos(bearing * Math.PI / 180) * adjustedSpeed;
                    dy -= Math.sin(bearing * Math.PI / 180) * adjustedSpeed;
                }
                
                // Q and E for rotation
                if (this.keys['q']) this.map.setBearing(bearing - this.rotateSpeed);
                if (this.keys['e']) this.map.setBearing(bearing + this.rotateSpeed);

                if (dx !== 0 || dy !== 0) {
                    this.map.setCenter([center.lng + dx, center.lat + dy]);
                }
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }
}
