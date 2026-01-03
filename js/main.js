import { ENGINE_CONFIG } from './utils/Config.js';
import { World } from './components/World.js';
import { PlayerEntity } from './components/Player.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

const startEngine = () => {
    if (typeof maplibregl === 'undefined') {
        console.error("Engine Error: MapLibre library not found. Retrying...");
        setTimeout(startEngine, 100);
        return;
    }

    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [-118.27307, 34.01309],
        zoom: 17, pitch: 70, antialias: true
    });

    map.on('load', () => {
        const world = new World(map, ENGINE_CONFIG);
        world.init();

        const playerInstances = [];
        const entityLayer = {
            id: 'entity-layer', type: 'custom', renderingMode: '3d',
            onAdd: function(map, gl) {
                this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
                this.renderer.autoClear = false;
                this.scene = new THREE.Scene();
                this.camera = new THREE.Camera();
                this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
                
                const loader = new THREE.TextureLoader();
                loader.setCrossOrigin('anonymous');
                
                ENGINE_CONFIG.PLAYERS.forEach(p => {
                    playerInstances.push(new PlayerEntity(p, this.scene, loader));
                });
            },
            render: function(gl, matrix) {
                this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
                const scale = document.getElementById('pScale').value;
                const height = document.getElementById('pHeight').value;
                
                playerInstances.forEach(p => p.update(map, scale, height, 0.69));
                
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                map.triggerRepaint();
            }
        };

        map.addLayer(entityLayer);

        document.getElementById('cityColor').addEventListener('input', (e) => world.updateBuildingColor(e.target.value));
        document.getElementById('sunAzimuth').addEventListener('input', (e) => {
            map.setLight({ position: [1.5, parseInt(e.target.value), 40] });
        });
    });
};

// Boot the system
startEngine();
