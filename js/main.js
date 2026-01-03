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
import { DisabledButtons } from './utils/DisabledButtons.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

const startEngine = () => {
    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: GAME_CONFIG.MAP_CENTER,
        zoom: 17,
        pitch: 60,
        antialias: true
    });

    map.on('load', () => {
        new DisabledButtons(map);
        new CameraControl(map);

        const grid = new Grid(map, GAME_CONFIG.GRID_SIZE);
        const territoryManager = new TerritoryManager(grid);
        
        const playerStart = grid.lngLatToGrid(GAME_CONFIG.MAP_CENTER[0], GAME_CONFIG.MAP_CENTER[1]);
        const player = new Player(0, 'PLAYER', 0x4A90E2, playerStart.x, playerStart.y);
        territoryManager.initializeTerritory(playerStart.x, playerStart.y, player.id, 7);

        const bots = GAME_CONFIG.BOT_SPAWNS.map((offset, i) => {
            const start = { x: playerStart.x + offset.x, y: playerStart.y + offset.y };
            const bot = new Bot(i + 1, `BOT_${i + 1}`, GAME_CONFIG.BOT_COLORS[i], start.x, start.y);
            territoryManager.initializeTerritory(start.x, start.y, bot.id, 7);
            return bot;
        });

        let territoryEffect, trailEffect;
        const gameLayer = {
            id: 'game-layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();
                this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
                this.renderer.autoClear = false;
                this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
                territoryEffect = new Territory(this.scene, grid);
                trailEffect = new Trail(this.scene, grid);
            },
            render: function(gl, matrix) {
                this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
                if (territoryEffect) territoryEffect.update();
                if (trailEffect) trailEffect.update(map, [player, ...bots]);
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                map.triggerRepaint();
            }
        };

        map.addLayer(gameLayer);
        new InputHandler(map, grid, player, territoryManager);
        new GameLoop(territoryManager, [player], bots).start();

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
