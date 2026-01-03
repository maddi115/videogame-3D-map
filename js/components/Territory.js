import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

export class Territory {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        this.container = new THREE.Group();
        this.scene.add(this.container);
        this.instancedMesh = null;
        this.colors = { 0: 0x4A90E2, 1: 0xE74C3C, 2: 0x2ECC71, 3: 0xF39C12 };
        this.cellData = [];
    }

    update() {
        const newCellData = [];
        this.grid.cells.forEach((cell, key) => {
            if (cell.owner !== null) {
                const [x, y] = key.split(',').map(Number);
                newCellData.push({ x, y, owner: cell.owner });
            }
        });

        if (newCellData.length !== this.cellData.length) {
            if (this.instancedMesh) {
                this.container.remove(this.instancedMesh);
                this.instancedMesh.geometry.dispose();
                this.instancedMesh.material.dispose();
            }
            if (newCellData.length > 0) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.8 });
                this.instancedMesh = new THREE.InstancedMesh(geometry, material, newCellData.length);
                this.container.add(this.instancedMesh);
                
                const dummy = new THREE.Object3D();
                const color = new THREE.Color();

                newCellData.forEach((cell, i) => {
                    const { lng, lat } = this.grid.gridToLngLat(cell.x, cell.y);
                    const merc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0);
                    const scale = merc.meterInMercatorCoordinateUnits() * this.grid.cellSizeMeters;
                    const height = 5 * scale; // Very flat for better anchoring

                    // We set positions once. The matrix in main.js handles the "sticking"
                    dummy.position.set(merc.x, merc.y, merc.z + height / 2);
                    dummy.scale.set(scale * 0.95, scale * 0.95, height);
                    dummy.updateMatrix();
                    this.instancedMesh.setMatrixAt(i, dummy.matrix);
                    
                    color.set(this.colors[cell.owner]);
                    this.instancedMesh.setColorAt(i, color);
                });
                this.instancedMesh.instanceMatrix.needsUpdate = true;
                if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;
            }
            this.cellData = newCellData;
        }
    }
}
