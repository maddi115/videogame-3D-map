import { GAME_CONFIG } from './utils/Config.js';
import { Player } from './components/Player.js';
import { Bot } from './components/Bot.js';
import { Grid } from './core/Grid.js';
import { TerritoryManager } from './core/TerritoryManager.js';
import { GameLoop } from './core/GameLoop.js';
import { InputHandler } from './utils/InputHandler.js';
import { CameraControl } from './utils/CameraControl.js';

// Modular Managers
import { GameStateOrchestrator } from './core/engine/GameStateOrchestrator.js';
import { LayerFactory } from './map/LayerFactory.js';

// Modular Disablers
import { disableDoubleClickZoom } from './utils/disabled/NoDoubleClickZoom.js';
import { disableBoxZoom } from './utils/disabled/NoBoxZoom.js';
import { disableKeyboardRotation } from './utils/disabled/NoKeyboardRotation.js';
import { disableLeftClickPan } from './utils/disabled/NoLeftClickPan.js';

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
        // Setup Interactions
        disableDoubleClickZoom(map);
        disableBoxZoom(map);
        disableKeyboardRotation(map);
        disableLeftClickPan(map);
        map.dragRotate.enable();
        new CameraControl(map);

        // Core Systems
        const grid = new Grid(map, GAME_CONFIG.GRID_SIZE);
        const territoryManager = new TerritoryManager(grid);

        // Entity Setup
        const playerStart = grid.lngLatToGrid(GAME_CONFIG.MAP_CENTER[0], GAME_CONFIG.MAP_CENTER[1]);
        const player = new Player(0, 'PLAYER', 0x64B5F6, playerStart.x, playerStart.y);
        territoryManager.initializeTerritory(playerStart.x, playerStart.y, player.id, 1);

        const bots = GAME_CONFIG.BOT_SPAWNS.map((offset, i) => {
            const start = { x: playerStart.x + offset.x, y: playerStart.y + offset.y };
            const bot = new Bot(i + 1, `BOT_${i + 1}`, GAME_CONFIG.BOT_COLORS[i], start.x, start.y);
            territoryManager.initializeTerritory(start.x, start.y, bot.id, 1);
            return bot;
        });

        // Initialize Specialized Managers
        const orchestrator = new GameStateOrchestrator(territoryManager, player, bots, grid);
        orchestrator.startHeartbeat(100);

        const gameLayer = LayerFactory.createGameLayer(grid, player, bots);
        map.addLayer(gameLayer);

        new InputHandler(map, grid, player, territoryManager);
        new GameLoop(territoryManager, [player], bots).start();
    });
};
startEngine();
