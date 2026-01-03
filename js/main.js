import { GAME_CONFIG } from './utils/Config.js';
import { Player } from './components/Player.js';
import { Bot } from './components/Bot.js';
import { Grid } from './core/Grid.js';
import { TerritoryManager } from './core/TerritoryManager.js';
import { GameLoop } from './core/GameLoop.js';
import { Territory } from './components/Territory.js';
import { Trail } from './components/Trail.js';
import { InputHandler } from './utils/InputHandler.js';
import { CameraControl } from './utils/CameraControl.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

const startEngine = () => {
    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: GAME_CONFIG.MAP_CENTER,
        zoom: 17,
        pitch: 60,
        antialias: true,
        // ENABLE standard dragPan so the engine listens for mouse moves
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        touchZoomRotate: false,
        doubleClickZoom: false
    });

    // THE FIX: Override the dragPan handler to ONLY trigger on Right Click (button 2)
    // MapLibre's default 'dragPan' uses button 0. We replace the check.
    const originalMouseDown = map.dragPan._onMouseDown;
    map.dragPan._onMouseDown = function(e) {
        if (e.originalEvent.button !== 2) return; // Ignore anything that isn't Right Click
        return originalMouseDown.call(this, e);
    };

    map.on('load', () => {
        const grid = new Grid(map, GAME_CONFIG.GRID_SIZE);
        const territoryManager = new TerritoryManager(grid);
        const playerStart = grid.lngLatToGrid(GAME_CONFIG.MAP_CENTER[0], GAME_CONFIG.MAP_CENTER[1]);
        const player = new Player(0, 'PLAYER', 0x4A90E2, playerStart.x, playerStart.y);
        
        territoryManager.initializeTerritory(playerStart.x, playerStart.y, player.id, 7);
        const bots = GAME_CONFIG.BOT_SPAWNS.map((offset, i) => {
            const botStart = { x: playerStart.x + offset.x, y: playerStart.y + offset.y };
            const bot = new Bot(i + 1, `BOT_${i + 1}`, GAME_CONFIG.BOT_COLORS[i], botStart.x, botStart.y);
            territoryManager.initializeTerritory(botStart.x, botStart.y, bot.id, 7);
            return bot;
        });

        const allEntities = [player, ...bots];
        let territoryEffect;

        // Initialize WASD Controls
        new CameraControl(map);

        const gameLayer = {
            id: 'game-layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });
                this.renderer.autoClear = false;
                this.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
                territoryEffect = new Territory(this.scene, grid);
            },
            render: function(gl, matrix) {
                const m = new THREE.Matrix4().fromArray(matrix);
                this.camera.projectionMatrix = m;
                if (territoryEffect) territoryEffect.update();
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                map.triggerRepaint();
            }
        };

        map.addLayer(gameLayer);
        new InputHandler(map, grid, player, territoryManager);
        const gameLoop = new GameLoop(territoryManager, [player], bots);
        gameLoop.start();

        setInterval(() => {
            bots.forEach(bot => {
                bot.update(grid, territoryManager);
                if (!bot.isExpanding() && bot.getTrail().length > 0) {
                    territoryManager.captureTerritory(bot.endExpansion(), bot.id);
                }
            });
        }, 200);
    });
};
startEngine();
