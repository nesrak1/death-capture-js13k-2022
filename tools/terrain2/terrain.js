let rnd = 12345;
function randPrngSeed() {
    let mod = 2 ** 31 - 1;
    rnd = 16807 * rnd % mod;
    return (rnd - 1) / (mod - 1);
}

class Terrain {
    constructor(detail) {
        this.size = Math.pow(2, detail) + 1;
        this.max = this.size - 1;
        this.map = new Float32Array(this.size * this.size);
    }
    get(x, y) {
        if (x < 0 || x > this.max || y < 0 || y > this.max)
            return -1;
        return this.map[x + this.size * y];
    }
    set(x, y, val) {
        this.map[x + this.size * y] = val;
    }
    generate(roughness) {
        var self = this;

        this.set(0, 0, self.max);
        this.set(this.max, 0, self.max / 2);
        this.set(this.max, this.max, 0);
        this.set(0, this.max, self.max / 2);

        divide(this.max);

        function divide(size) {
            var x, y, half = size / 2;
            var scale = roughness * size;
            if (half < 1)
                return;

            for (y = half; y < self.max; y += size) {
                for (x = half; x < self.max; x += size) {
                    square(x, y, half, randPrngSeed() * scale * 2 - scale);
                }
            }
            for (y = 0; y <= self.max; y += half) {
                for (x = (y + half) % size; x <= self.max; x += size) {
                    diamond(x, y, half, randPrngSeed() * scale * 2 - scale);
                }
            }
            divide(size / 2);
        }

        function average(values) {
            var valid = values.filter(function (val) { return val !== -1; });
            var total = valid.reduce(function (sum, val) { return sum + val; }, 0);
            return total / valid.length;
        }

        function square(x, y, size, offset) {
            var ave = average([
                self.get(x - size, y - size),
                self.get(x + size, y - size),
                self.get(x + size, y + size),
                self.get(x - size, y + size) // lower left
            ]);
            self.set(x, y, ave + offset);
        }

        function diamond(x, y, size, offset) {
            var ave = average([
                self.get(x, y - size),
                self.get(x + size, y),
                self.get(x, y + size),
                self.get(x - size, y) // left
            ]);
            self.set(x, y, ave + offset);
        }
    }
}



