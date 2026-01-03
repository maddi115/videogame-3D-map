export class World {
    constructor(map, config) {
        this.map = map;
        this.config = config;
    }

    init() {
        const layers = this.map.getStyle().layers;
        layers.forEach(layer => {
            if (layer.id.includes('road') || layer.id.includes('highway') || layer.id.includes('street')) {
                if (layer.type === 'line') {
                    this.map.setPaintProperty(layer.id, 'line-color', this.config.STREET_COLOR);
                }
            }
        });

        this.map.addLayer({
            id: '3d-buildings',
            source: 'carto',
            'source-layer': 'building',
            type: 'fill-extrusion',
            filter: ['>', ['get', 'render_height'], this.config.BUILDING_MIN_HEIGHT],
            paint: {
                'fill-extrusion-color': '#5C6A73',
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height'],
                'fill-extrusion-vertical-gradient': true
            }
        });
    }

    updateBuildingColor(color) {
        if (this.map.getLayer('3d-buildings')) {
            this.map.setPaintProperty('3d-buildings', 'fill-extrusion-color', color);
        }
    }
}
