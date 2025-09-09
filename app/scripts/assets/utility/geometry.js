export function getDirectionFromVector(v) {
    const angle = (Math.atan2(v[1], -v[0]) + Math.PI) * 180 / Math.PI;

    if (45 <= angle && angle < 135) {
        return 'up';
    }
    else if (135 <= angle && angle < 225) {
        return 'left';
    }
    else if (225 <= angle && angle < 315) {
        return 'down';
    }
    else {
        return 'right';
    }
}

globalThis.Object.defineProperty(Array.prototype, 'contains', {
    value: function (position) {
        return this[0] <= position[0] && position[0] < this[0] + this[2] && this[1] <= position[1] && position[1] < this[1] + this[3];
    },
});

globalThis.Object.defineProperty(Array.prototype, 'expand', {
    value: function (size, anchor=[0.5, 0.5]) {
        if (size.length === 1) {
            size = [size[0], size[0]];
        }
        else if (!Number.isNaN(size)) {
            size = [size, size];
        }
        return [this[0] - size[0] * anchor[0], this[1] - size[1] * anchor[1], this[2] + size[0], this[3] + size[1]];
    },
});

globalThis.Object.defineProperty(Array.prototype, 'shrink', {
    value: function (size, anchor=[0.5, 0.5]) {
        if (size.length === 1) {
            size = [size[0], size[0]];
        }
        else if (!Number.isNaN(size)) {
            size = [size, size];
        }
        return [this[0] + size[0] * anchor[0], this[1] + size[1] * anchor[1], this[2] - size[0], this[3] - size[1]];
    },
});