/**
 * FILE: MatrixAnchorBridge.js
 * CONTEXT: The "Anchor" for the 3D-Geographic bridge.
 * * WHY IT MATTERS: 
 * MapLibre uses a Mercator projection, while Three.js uses a standard 3D coordinate system.
 * Without this bridge, 3D objects would "slide" or "float" when the map tilts or rotates.
 * * WHAT IT DOES:
 * 1. calculateAnchorMatrix: Locks a 3D Mesh to a specific Lng/Lat and Grid cell.
 * 2. syncView: Forces the Three.js camera to mimic the Map's perspective matrix exactly.
 * * CRITICAL: This is the project's 'source of truth' for spatial positioning.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

export class MatrixAnchorBridge {
    static calculateAnchorMatrix(grid, x, y, heightScale) {
        const { lng, lat } = grid.gridToLngLat(x, y);
        const merc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0);
        const scale = merc.meterInMercatorCoordinateUnits() * grid.cellSizeMeters;
        
        const height = heightScale * scale;
        const dummy = new THREE.Object3D();

        // Offset epsilon (0.000001) prevents the sleek boxes from flickering against the ground
        dummy.position.set(merc.x, merc.y, merc.z + height / 2 + 0.000001);
        dummy.scale.set(scale, scale, height);
        dummy.updateMatrix();
        
        return dummy.matrix;
    }

    static syncView(camera, matrixArray) {
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrixArray);
    }
}
