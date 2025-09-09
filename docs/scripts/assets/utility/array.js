globalThis.Object.defineProperty(Array.prototype, 'set', {
    value: function (other) {
        if (other instanceof Array) {
            if (other.length === this.length) {
                this.splice(0, this.length, ...other);
                return this;
            }
            else {
                throw 'vector length mismatched.';
            }
        }
        else {
            return this.fill(other);
        }
    },
});

globalThis.Object.defineProperty(Array.prototype, 'equals', {
    value: function (other) {
        if (other.length === this.length) {
            return this.every((value, index) => value === other[index]);
        }
        else if (other.length === 1) {
            return this.every(value => value === other[0]);
        }
        else {
            return this.every(value => value === other);
        }
    }
});

globalThis.Object.defineProperty(Array.prototype, 'remove', {
    value: function (other) {
        const index = this.indexOf(other);
        if (index >= 0) {
            this.splice(index, 1);
        }
    }
});

Array.repeat = function (count, value) {
    if (count instanceof Array) {
        if (count.length === 0) { return null }
        return Array.repeat(
            count[0],
            count.length === 1
                ? value
                : () => Array.repeat(count.slice(1), value)
        );
    }
    else {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(value instanceof Function ? value() : value);
        }
        return result;
    }
};