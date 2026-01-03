export const disableLeftClickPan = (map) => {
    if (map.dragPan) map.dragPan.disable();
};
