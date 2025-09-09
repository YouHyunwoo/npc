globalThis.Object.defineProperty(Array.prototype, 'add', {
    value: function (other) {
        if (other instanceof Array) {
            if (other.length === 1) {
                return this.map(value => value + other[0]);
            }
            else if (other.length === this.length) {
                return this.map((value, index) => value + other[index]);
            }
            else {
                throw 'vector length mismatched.';
            }
        }
        else {
            return this.map(value => value + other);
        }
    },
});

globalThis.Object.defineProperty(Array.prototype, 'sub', {
    value: function (other) {
        if (other instanceof Array) {
            if (other.length === 1) {
                return this.map(value => value - other[0]);
            }
            else if (other.length === this.length) {
                return this.map((value, index) => value - other[index]);
            }
            else {
                throw 'vector length mismatched.';
            }
        }
        else {
            return this.map(value => value - other);
        }
    },
});

globalThis.Object.defineProperty(Array.prototype, 'mul', {
    value: function (other) {
        if (other instanceof Array) {
            if (other.length === 1) {
                return this.map(value => value * other[0]);
            }
            else if (other.length === this.length) {
                return this.map((value, index) => value * other[index]);
            }
            else {
                throw 'vector length mismatched.';
            }
        }
        else {
            return this.map(value => value * other);
        }
    },
});

globalThis.Object.defineProperty(Array.prototype, 'div', {
    value: function (other) {
        if (other instanceof Array) {
            if (other.length === 1) {
                return this.map(value => value / other[0]);
            }
            else if (other.length === this.length) {
                return this.map((value, index) => value / other[index]);
            }
            else {
                throw 'vector length mismatched.';
            }
        }
        else {
            return this.map(value => value / other);
        }
    },
});

globalThis.Object.defineProperty(Array.prototype, 'dot', {
    value: function (other) {
        if (other.length === this.length) {
            return this.reduce((acc, cur, idx) => acc + cur * other[idx], 0);
        }
        else {
            throw 'vector length mismatched.';
        }
    }
});

globalThis.Object.defineProperty(Array.prototype, 'negate', {
    get() { return this.mul(-1) }
});

globalThis.Object.defineProperty(Array.prototype, 'magnitude', {
    get() { return Math.sqrt(this.dot(this)) }
});

globalThis.Object.defineProperty(Array.prototype, 'normalize', {
    value: function () { return this.div(this.magnitude) }
});

export const ZERO = [0, 0];