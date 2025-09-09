globalThis.Object.defineProperty(Math, 'clamp', {
    value: function (value, min, max) {
        return Math.max(min, Math.min(value, max));
    },
});

globalThis.Object.defineProperty(Array.prototype, 'sum', {
    value: function () {
        return this.reduce((sum, value) => sum + value, 0);
    },
});

globalThis.Object.defineProperty(Math, 'sigmoid', {
    value: function (x) {
        return 1 / (1 + Math.exp(-x));
    },
});