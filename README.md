# TERRITORIAL_3D
**Current State:** ANCHORED (Sleek/Bulky)

## Technical Summary for AI Context
This is a 3D territorial expansion game built on **MapLibre GL** and **Three.js**.

### The Matrix Anchor (Crucial)
The project relies on `js/utils/MatrixAnchorBridge.js`. This file handles the `projectionMatrix` synchronization between the map's Mercator coordinate system and the Three.js camera. It prevents 3D objects from drifting when the map is tilted or rotated.

### Current Configuration
- **Visuals:** Sleek, low-profile tiles (height: 1.5). Opacity: 0.49.
- **Grid:** Large-scale cells (Grid Size: 80).
- **Optimization:** Uses `InstancedMesh` for all territory rendering to maintain 60FPS.
- **Stability:** The `onAdd` method in `main.js` explicitly clears the Three.js scene and removes default MapLibre `fill-extrusion` layers to prevent ghost/static cubes.

### Component Roles
- `Player.js` / `Bot.js`: Handle logical movement and trail arrays.
- `Territory.js`: Renders the owned bulky grids.
- `Trail.js`: Renders the active expansion path.
- `InputHandler.js`: Bridge between mouse/touch events and grid movement.
