export class RenderLoop {
    constructor(map, fps = 60) {
        this.map = map;
        this.interval = null;
        this.fps = fps;
        this.frameTime = 1000 / fps;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            this.map.triggerRepaint();
        }, this.frameTime);
        console.log(`RenderLoop started at ${this.fps}fps`);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('RenderLoop stopped');
        }
    }

    setFPS(fps) {
        this.fps = fps;
        this.frameTime = 1000 / fps;
        if (this.interval) {
            this.stop();
            this.start();
        }
    }
}
