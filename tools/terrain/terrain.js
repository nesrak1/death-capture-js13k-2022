let rnd = 12345;
function randPrngSeed() {
    let mod = 2 ** 31 - 1;
    rnd = 16807 * rnd % mod;
    return (rnd - 1) / (mod - 1);
}
/*
function fb2u(float) {
    let buf = new ArrayBuffer(4);
    let f = new Float32Array(buf);
    f[0] = float;
    let u = new Uint32Array(buf);
    return u[0];
}*/

/*function spatialSubdivision(H, rand, randRange) {
    const nb = 2 * (H.length - 1) + 1;

    const H2 = [];
    // for each cell in new array
    for (let i = 0; i < nb; i++) {
        H2[i] = [];
        let I = i >> 1;
        for (let j = 0; j < nb; j++) {
            let J = j >> 1;
            // Interpolate current cells
            H2[i][j] = (H[I][J] + H[I + (i & 1)][J] + H[I][J + (j & 1)] + H[I + (i & 1)][J + (j & 1)]) / 4;
            // Add randomness on new cells
            if (i & 1 || j & 1) H2[i][j] += rand() - randRange / 2;
        }
    }

    return H2;
}

function genTerrain() {
    let H = [[randSeed(), randSeed()], [randSeed(), randSeed()]];

    const p1 = 0.8;
    const p2 = 1.2;
    const res = 11;

    let f = p1;
    for (let n = 0; n < res; n++) {
        let f2 = 2 * f;
        H = spatialSubdivision(H, function () {
            return randSeed() * f2 - f;
        }, f2 - f);
        f /= 2 ** p2;
    }

    const N = H.length;

    // Compute heightmap stats
    let [min, max] = [+Infinity, -Infinity];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let h = H[i][j];
            min = Math.min(min, h);
            max = Math.max(max, h);
        }
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            H[i][j] -= min;
            H[i][j] *= 120;
        }
    }

    return H;
}

function divideTerrain(H) {
    let H2 = [];
    let size = H.length;
    for (let i = 0; i < size / 2; i += 2) {
        let l = [];
        for (var j = 0; j < size / 2; j += 2) {
            let v = (H[i+0][j+0] + H[i+0][j+1] + H[i+1][j+0] + H[i+1][j+1]) / 4;
            l.push(v);
        }
        H2.push(l);
    }
    return H2;
}*/

// https://github.com/joeiddon/perlin/blob/master/perlin.js
// unlicensed, but looks like it's just a port of https://en.wikipedia.org/wiki/Perlin_noise#Implementation
//let perlin = {
//    rand_vect: function(){
//        let theta = randSeed() * 2 * Math.PI;
//        return {x: Math.cos(theta), y: Math.sin(theta)};
//    },
//    dot_prod_grid: function(x, y, vx, vy){
//        let g_vect;
//        let d_vect = {x: x - vx, y: y - vy};
//        if (this.gradients[[vx,vy]]){
//            g_vect = this.gradients[[vx,vy]];
//        } else {
//            g_vect = this.rand_vect();
//            this.gradients[[vx, vy]] = g_vect;
//        }
//        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
//    },
//    smootherstep: function(x){
//        return 6*x**5 - 15*x**4 + 10*x**3;
//    },
//    interp: function(x, a, b){
//        return a + this.smootherstep(x) * (b-a);
//    },
//    seed: function(){
//        this.gradients = {};
//        this.memory = {};
//    },
//    get: function(x, y) {
//        //if (this.memory.hasOwnProperty([x,y]))
//        //    return this.memory[[x,y]];
//        let xf = Math.floor(x);
//        let yf = Math.floor(y);
//        //interpolate
//        let tl = this.dot_prod_grid(x, y, xf,   yf);
//        let tr = this.dot_prod_grid(x, y, xf+1, yf);
//        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
//        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
//        let xt = this.interp(x-xf, tl, tr);
//        let xb = this.interp(x-xf, bl, br);
//        let v = this.interp(y-yf, xt, xb);
//        //this.memory[[x,y]] = v;
//        return v;
//    }
//}

var randMap;
function initMap() {
    randMap = [];
    for (let i = 0; i < 512*512; i++) {
        randMap.push(randPrngSeed());
    }
}

function smootherstep(x) {
    return 6*x**5 - 15*x**4 + 10*x**3;
}
function interpolate(a, b, x) {
    return a + smootherstep(x) * (b-a);
}

function randomGradient(x, y) {
    let rand = randMap[x * 512 + y] * 2 * Math.PI;
    return [Math.cos(rand), Math.sin(rand)];
}

function dotGridGradient(ix, iy, x, y) {
    let gradient = randomGradient(ix, iy);
    
    let dx = x - ix;
    let dy = y - iy;
    
    return dx*gradient[0] + dy*gradient[1];
}

function perlin(x, y) {
    let x0 = Math.floor(x);
    let x1 = x0 + 1;
    let y0 = Math.floor(y);
    let y1 = y0 + 1;

    let sx = x - x0;
    let sy = y - y0;

    let n0 = dotGridGradient(x0, y0, x, y);
    let n1 = dotGridGradient(x1, y0, x, y);
    let ix0 = interpolate(n0, n1, sx);

    n0 = dotGridGradient(x0, y1, x, y);
    n1 = dotGridGradient(x1, y1, x, y);
    let ix1 = interpolate(n0, n1, sx);

    return interpolate(ix0, ix1, sy);
}