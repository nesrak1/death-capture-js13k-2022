function makeArray(d1, d2) {
    let arr = [];
    for (let i = 0; i < d2; i++) {
        arr.push(new Array(d1));
    }
    return arr;
}
const avg = (array) => array.reduce((a, b) => a + b) / array.length;

let rnd = 1234;
function randPrngSeed() {
    let mod = 2 ** 31 - 1;
    rnd = 16807 * rnd % mod;
    return (rnd - 1) / (mod - 1);
}

function clamp(min, value, max) {
	return Math.min(Math.max(min, value), max);
}

function flipVec(u) {
	return [-u[0], -u[1], -u[2]];
}
function lenVec(u) {
    return Math.sqrt((u[0]*u[0])+(u[1]*u[1])+(u[2]*u[2]));
}
function distVec(u, v) {
    return lenVec(subVec(u, v));
}
function normVec(u) {
    var l = lenVec(u);
    if (l > 0)
        return [u[0]/l,u[1]/l,u[2]/l];
    else
        return [0,0,0];
}
function addVec(u, v) {
	return [u[0]+v[0], u[1]+v[1], u[2]+v[2]];
}
function subVec(u, v) {
	return [u[0]-v[0], u[1]-v[1], u[2]-v[2]];
}
function mulVec(u, v) {
    return [u[0]*v[0], u[1]*v[1], u[2]*v[2]];
}

function lerp(a, b, x) {
    return a + x * (b - a);
}

function tfmPositionVec(mat) {
    return [mat[12], mat[13], mat[14]];
}

function arrRemove(arr, item) {
    let idx = arr.indexOf(item);
    if (idx != -1) {
        arr.splice(idx, 1);
    }
}

function arrRandSort(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}