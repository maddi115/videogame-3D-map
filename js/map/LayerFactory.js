import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';
import { MatrixAnchorBridge } from '../utils/MatrixAnchorBridge.js';
import { Territory } from '../components/Territory.js';
import { Trail } from '../components/Trail.js';

export class LayerFactory {
    static createGameLayer(grid, player, bots) {
        let territoryEffect, trailEffect;

        return {
            id: 'game-layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();
                this.scene.clear();
                
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });
                this.renderer.autoClear = false;
                
                this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
                territoryEffect = new Territory(this.scene, grid);
                trailEffect = new Trail(this.scene, grid);
            },
            render: function(gl, matrix) {
                MatrixAnchorBridge.syncView(this.camera, matrix);
                if (territoryEffect) territoryEffect.update();
                if (trailEffect) trailEffect.update(map, [player, ...bots]);
                
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                map.triggerRepaint();
            }
        };
    }
}
