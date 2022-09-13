var WINW = 960;
var WINH = 720;
var seed = Math.PI;
var pi = Math.PI;
function seededRand() {
    return seed = seededRandOne(seed);
}
function seededRandOne(seed) {
    if (seed == 0)
        seed = 0.1;
    return Math.sin(1/(seed/1e7))/2;
}
function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}