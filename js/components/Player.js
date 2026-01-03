import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

export class PlayerEntity {
    constructor(data, scene, loader) {
        this.data = data;
        const mat = data.texture 
            ? new THREE.MeshBasicMaterial({ map: loader.load(data.texture), transparent: true, opacity: 0.9, side: THREE.FrontSide, depthWrite: true })
            : new THREE.MeshBasicMaterial({ color: 0x0077ff, transparent: true, opacity: 0.69, side: THREE.FrontSide });
        
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
        scene.add(this.mesh);
        
        this.label = document.createElement("div");
        this.label.className = "player-label";
        this.label.innerText = data.id;
        document.getElementById('labelContainer').appendChild(this.label);
    }

    update(map, scale, height, opacity) {
        const c = maplibregl.MercatorCoordinate.fromLngLat([this.data.lng, this.data.lat], 0);
        const s = c.meterInMercatorCoordinateUnits();
        const targetH = this.data.state * height * s;
        
        this.mesh.scale.set(scale * s, scale * s, targetH);
        this.mesh.position.set(c.x, c.y, c.z + (targetH / 2));
        this.mesh.material.opacity = opacity;

        const pos = map.project([this.data.lng, this.data.lat]);
        this.label.style.left = `${pos.x}px`;
        this.label.style.top = `${pos.y - 30}px`;
    }
}
