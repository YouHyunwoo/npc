const random = {
    pick: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    generate: function (count) {
        return Array.from({ length: count }, () => Math.random());
    },
    binomial(n, p, size=1) {
        if (n <= 0 || p <= 0) { return Array(size).fill(0) }

        return Array.repeat(size, () => {
            let result = 0;
            for (let i = 0; i < n; i++) {
                if (Math.random() < p) { result++ }
            }
            return result;
        });
    }
};

export default random;