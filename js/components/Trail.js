import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

export class Trail {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        this.meshes = new Map();
    }

    update(map, entities) {
        entities.forEach(entity => {
            const trail = entity.getTrail();
            if (!entity.isExpanding() || trail.length === 0) {
                if (this.meshes.has(entity.id)) {
                    const m = this.meshes.get(entity.id);
                    this.scene.remove(m);
                    m.geometry.dispose();
                    m.material.dispose();
                    this.meshes.delete(entity.id);
                }
                return;
            }

            let mesh = this.meshes.get(entity.id);
            if (!mesh || mesh.count !== trail.length) {
                if (mesh) { 
                    this.scene.remove(mesh); 
                    mesh.geometry.dispose(); 
                    mesh.material.dispose(); 
                }
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ 
                    color: entity.color, 
                    transparent: true, 
                    opacity: 0.3 
                });
                mesh = new THREE.InstancedMesh(geometry, material, trail.length);
                mesh.frustumCulled = false;
                this.scene.add(mesh);
                this.meshes.set(entity.id, mesh);
            }

            const dummy = new THREE.Object3D();
            trail.forEach((point, i) => {
                const { lng, lat } = this.grid.gridToLngLat(point.x, point.y);
                const merc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0);
                const scale = merc.meterInMercatorCoordinateUnits() * this.grid.cellSizeMeters;
                const height = 1.6 * scale;
                dummy.position.set(merc.x, merc.y, merc.z + height / 2);
                dummy.scale.set(scale, scale, height);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
        });
    }
}
