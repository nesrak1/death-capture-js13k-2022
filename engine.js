///////////////////////////////////////////////////
//  the y engine                                 //
///////////////////////////////////////////////////

/** @type {WebGL2RenderingContext} */
var gl;
/** @type {HTMLCanvasElement} */
var cangl;
/** @type {CanvasRenderingContext2D} */
var ctx;
/** @type {HTMLCanvasElement} */
var can2d;

var scene = [];
var cam = {x:0,y:0,z:0,a:0,b:0,c:0};
const pi = Math.PI;
var engFrame;

const WINW = 960;
const WINH = 720;

//#region debugging input
var mouseDown = [], mouseJustDown = [], xMouse, yMouse;
var keysDown = {};

function setupInput() {
    can2d.onclick = function() {
        can2d.requestPointerLock();
    };
    document.onmouseup = (e) => {
        mouseDown[e.button] = false;
        mouseJustDown[e.button] = false;
    }
    document.onmousedown = (e) => {
        mouseDown[e.button] = true;
        mouseJustDown[e.button] = true;
    }
    document.addEventListener("mousemove", setMousePos, false);
	
    document.addEventListener("pointerlockchange", pointerLockEvent, false);

    document.onkeydown = (e) => {
        keysDown[e.keyCode] = true;
    };
    document.onkeyup = (e) => {
        keysDown[e.keyCode] = false;
    };
}

function pointerLockEvent() {
    if (document.pointerLockElement === can2d) {
        document.addEventListener("mousemove", updateMouse, false);
    } else {
        document.removeEventListener("mousemove", updateMouse, false);
    }
}

function setMousePos(e) {
    var rect = cangl.getBoundingClientRect();
    xMouse = e.clientX - rect.left;
    yMouse = e.clientY - rect.top;
}

//function updateMouse(e) {
//    cam.b -= e.movementX/200;
//    cam.a -= e.movementY/200;
//}

function handleDebugCameraControls() {
    const MOVE_SPEED = 0.2;

    if (keysDown[65]) {
        move(MOVE_SPEED, 180);
    } else if (keysDown[68]) {
        move(MOVE_SPEED, 0);
    }

    if (keysDown[87]) {
        move(MOVE_SPEED, -90);
    } else if (keysDown[83]) {
        move(MOVE_SPEED, 90);
    }

    if (keysDown[32]) {
        cam.y += MOVE_SPEED;
    } else if (keysDown[16] || keysDown[67]) {
        cam.y -= MOVE_SPEED;
    }
}

function move(len, deg) {
	var ang = (deg * pi/180) - cam.b
	deg *= pi/180;
    cam.x += len * Math.cos(ang);
    cam.z += len * Math.sin(ang);
}
//#endregion debugging input

function setup() {
    cangl = document.getElementById("g");
    gl = cangl.getContext("webgl2");

    can2d = document.getElementById("e");
    ctx = can2d.getContext("2d");

    gl.enable(GL_DEPTH_TEST); //might affect blur
    gl.enable(GL_BLEND);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	
	loadShaders();
    setupShadows();

    engFrame = 0;
	
	//#region remove
	setupInput();
	//#endregion
}

let lastRanderTime = 0;
function rander(time) {
    render(time - lastRanderTime);
    let updates = Math.floor((time - lastRanderTime) / (1000/60));
    //console.log(updates, time - lastRanderTime);
    for (let i = 0; i < updates; i++) {
        update();
        mouseJustDown = [];
        lastRanderTime += 1000/60;
    }
    requestAnimationFrame(rander);
}


function render(delta) {
    ctx.clearRect(0, 0, WINW, WINH);
    gl.clearColor(0.3,0.05,0.05, 1);
    //gl.clearColor(0.95,0.95,0.95, 1);
    //handleKeys();

    //if (keysDown[69]) {
	//    setLightPos(cam.x, cam.y, cam.z, cam.a, cam.b);
    //}

    // shadows
    gl.clearDepth(1);
    gl.depthFunc(GL_LEQUAL);
	gl.viewport(0, 0, shadowTs, shadowTs);
    gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	gl.cullFace(GL_FRONT);

    gl.useProgram(shaderHouse.shadow.prog);
    activeShader = shaderHouse.shadow.prog;
    gl.bindFramebuffer(GL_FRAMEBUFFER, depthMapFbo);
        gl.clear(GL_DEPTH_BUFFER_BIT);

        scene.forEach(obj => {
            renderMdl(obj, shaderHouse.shadow);
            renderAllChildren(obj, shaderHouse.shadow);
        });
    gl.bindFramebuffer(GL_FRAMEBUFFER, null);

	gl.cullFace(GL_BACK);

    // normal 3d
    gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    scene.forEach(obj => {
        renderMdl(obj, obj.wgm.shd);
        renderAllChildren(obj, obj.wgm.shd);
    });

    function renderAllChildren(parent, shader) {
        parent.chd.forEach(obj => {
            renderMdl(obj, shader, parent.tfm);
            renderAllChildren(obj, shader);
        });
    }

    engFrame += delta / 1000;
}

function renderMdl(obj, shader, offTfm=null) {
    var tfm = obj.tfm;
    if (offTfm != null) {
        tfm = dot(offTfm, obj.tfm);
    }
    var info = {
        proj: new Float32Array(perspProjection(gl.canvas.clientWidth / gl.canvas.clientHeight, 0.85)),
        vm: new Float32Array(lookAtFps([cam.x,cam.y,cam.z],cam.a,cam.b)),
        mm: new Float32Array(tfm),
        time: engFrame
    };
    shader.draw(shader, info, obj.wgm);
}

function enableBuffer(attr, buff, compCount) {
    gl.bindBuffer(GL_ARRAY_BUFFER, buff);
    gl.vertexAttribPointer(attr, compCount, GL_FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attr);
}

//#region camera
function lookAtFps(eye, pitch, yaw) {
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var cosYaw = Math.cos(yaw);
    var sinYaw = Math.sin(yaw);

    var xaxis = [cosYaw, 0, -sinYaw];
    var yaxis = [sinYaw * sinPitch, cosPitch, cosYaw * sinPitch];
    var zaxis = [sinYaw * cosPitch, -sinPitch, cosPitch * cosYaw];

    return [
        xaxis[0],yaxis[0],zaxis[0],0,
        xaxis[1],yaxis[1],zaxis[1],0,
        xaxis[2],yaxis[2],zaxis[2],0,
        -dot3(xaxis,eye),-dot3(yaxis,eye),-dot3(zaxis,eye),1
    ];

    function dot3(u, v) {
        return u[0]*v[0]+u[1]*v[1]+u[2]*v[2];
    }
}
//#endregion

//#region scene
function addObj(wgm, tfm) {
    var item = makeObj(wgm, tfm);
    scene.push(item);
    return item;
}

function makeObj(wgm, tfm) {
    return {wgm:wgm, tfm:tfm, chd:[]};
}

function removeObj(obj, deleteBuffers=false) {
    var idx = scene.indexOf(obj);
    if (deleteBuffers) {
        gl.deleteBuffer(obj.pos);
        gl.deleteBuffer(obj.idx);
        gl.deleteBuffer(obj.nrm);
        gl.deleteBuffer(obj.col);
    }
    
    if (idx !== -1) {
        scene.splice(idx, 1);
    }
}

function loadWgm(mdl, shd) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(GL_ARRAY_BUFFER, positionBuffer);
    gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(mdl.v), GL_STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, new Uint32Array(mdl.i), GL_STATIC_DRAW);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(GL_ARRAY_BUFFER, normalBuffer);
    gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(mdl.n), GL_STATIC_DRAW);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(GL_ARRAY_BUFFER, colorBuffer);
    gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(mdl.c), GL_STATIC_DRAW);

    return {
        pos: positionBuffer,
        idx: indexBuffer,
        nrm: normalBuffer,
        col: colorBuffer,
        ict: mdl.i.length,
        shd: shd/*.comp*/,
        prp: shd.prop
    };
}
//#endregion

//#region math
var dot;
function makeDot() {
    var out = "return [";
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 4; j++) {
            out += `a[${j*4+i%4}]*b[${j%4+Math.floor(i/4)*4}]`;
            if (j != 3)
                out += "+";
        }
        if (i != 15)
            out += ",";
    }
    out += "];";
    dot = new Function("a","b",out);
}
makeDot();

function tfm(x,y,z, a=0,b=0,c=0, d=1,e=1,f=1) {
    return transform({x:x,y:y,z:z,a:a,b:b,c:c,d:d,e:e,f:f});
}

function transform(tra) {
    var a = Math.cos(tra.a), b = Math.sin(tra.a);
    var c = Math.cos(tra.b), d = Math.sin(tra.b);
    var e = Math.cos(tra.c), f = Math.sin(tra.c);
    var p = tra.d, q = tra.e, r = tra.f;
    var x = tra.x, y = tra.y, z = tra.z;
    var T = [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
    var A = [e,f,0,0, -f,e,0,0, 0,0,1,0, 0,0,0,1];
    var B = [c,0,-d,0, 0,1,0,0, d,0,c,0, 0,0,0,1];
    var C = [1,0,0,0, 0,a,b,0, 0,-b,a,0, 0,0,0,1];
    var S = [p,0,0,0, 0,q,0,0, 0,0,r,0, 0,0,0,1];
    return dot(T,dot(S,dot(C,dot(A,B))));
}

var near = 0.1;
var far = 1000;
var onear = 0.1;
var ofar = 500;
function perspProjection(aspect, fov) {
    var f = Math.tan(pi/2 - fov/2);
    var rangeInv = 1/(near - far);
    return [
        f/aspect,0,0,0,
        0,f,0,0,
        0,0,(near+far)*rangeInv,-1,
        0,0,near*far*rangeInv*2,0
    ];
}

function orthoProjection(left, right, bottom, top) {
	var lr = 1 / (left - right);
	var bt = 1 / (bottom - top);
	var nf = 1 / (onear - ofar);
	var row4col1 = (left + right) * lr;
	var row4col2 = (top + bottom) * bt;
	var row4col3 = (ofar + onear) * nf;
	return [
		-2*lr,0,0,0,
		0,-2*bt,0,0,
		0,0,2*nf,0,
		row4col1,row4col2,row4col3,1
	];
}

function getPosition(mat) {
	return [mat[12], mat[13], mat[14]];
}

function setPosition(mat, x,y,z) {
	mat[12] = x;
	mat[13] = y;
	mat[14] = z;
	return mat;
}
//#endregion

//#region shaders
function loadShaderProg(vertSrc, fragSrc) {
    var prog = gl.createProgram();
    gl.attachShader(prog, loadShader(GL_VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, loadShader(GL_FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    return prog;
}

function loadShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    //#region remove
    var compilationLog = gl.getShaderInfoLog(shader);
    if (compilationLog != "") {
        console.log("for " + (type == GL_VERTEX_SHADER ? "vertex" : "fragment") + ": \n" + compilationLog);
	}
    //#endregion
    return shader;
}
//#endregion

function startGame() {
	setup();
	requestAnimationFrame(rander);
}