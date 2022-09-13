//@ts-check
var c = /**@type {HTMLCanvasElement}*/(document.getElementById("c"));
var p = /**@type {HTMLCanvasElement}*/(document.getElementById("p"));
var colorList = /**@type {HTMLDivElement}*/(document.getElementById("colorList"));
var saveText = /**@type {HTMLParagraphElement}*/(document.getElementById("saveText"));
var ctx = c.getContext("2d");
var pctx = p.getContext("2d");

var md = false;
var rmd = false;
var mx = 0;
var my = 0;

var selColor = 1;
var sel2Color = 0;

var WIDTH = 16;
var HEIGHT = 16;
var PIXEL_SIZE = 32;
var COMP_DATA_LEN = 64;
var test = false;

var imgWidth = WIDTH;
var imgHeight = HEIGHT;
var img = new Array(imgWidth * imgHeight).fill(0);
var imgPalette = [[0,0,0],[28, 43, 83],[127, 36, 84],[0, 135, 81],[171, 82, 54],[96, 88, 79],[195, 195, 198],[255, 241, 233],[237, 27, 81],[250, 162, 27],[247, 236, 47],[93, 187, 77],[81, 166, 220],[131, 118, 156],[241, 118, 166],[252, 204, 171]];

function start() {
    imgPalette.forEach((p, i) => {
        var palBtn = document.createElement("button");
        palBtn.id = `btn${i}`;
        //@ts-ignore
        palBtn.style = `background-color:rgb(${p[0]},${p[1]},${p[2]});border:2px #000 solid;width:50px;height:50px;`;
        palBtn.onclick = function() {selColor = i;}
        palBtn.oncontextmenu = function() {sel2Color = i;return false;};
        colorList.appendChild(palBtn);
    });
    c.oncontextmenu = (e) => {
        e.preventDefault();
    }
    document.onmouseup = (e) => {
		if (e.button == 0)
			md = false;
		else //(e.button == 2)
			rmd = false;
	};
    c.onmousedown = (e) => {
		if (e.button == 0)
			md = true;
		else //(e.button == 2)
			rmd = true;
	};
    document.onmousemove = (e) => {
        mx = e.clientX - c.offsetLeft;
        my = e.clientY - c.offsetTop;
    };
    requestAnimationFrame(update);
}
function update() {
    handleInput();
    draw();
    requestAnimationFrame(update);
}

function load() {
    var imp = prompt("paste image");
    if (imp == "" || imp == null)
        return;

    resetLoad(imp);
    var size = decode(2)+1;
    var palette = [];
    for (var i = 0; i < (2**size); i++) {
        palette[i] = decode(4);
    }
    for (var i = 0; i < img.length; i++) {
        img[i] = palette[decode(size)];
    }
}

function save() {
    var imgMod = [];
    var palette = getPalette();
    var paletteCount = palette.length;
    var enc;
	var maxPalette = 9000;
    reset();
    if (paletteCount <= 2) {
        encodeNum(0, 2, COMP_DATA_LEN);
        for (var i = 0; i < 2; i++)
            encodeNum(palette[i], 4, COMP_DATA_LEN);
        for (var i = 0; i < img.length; i++)
            imgMod.push(palette.indexOf(img[i]));
        encode(imgMod, 1, COMP_DATA_LEN);
        enc = encodeLast();
		maxPalette = 2;
    } else if (paletteCount <= 4) {
        encodeNum(1, 2, COMP_DATA_LEN);
        for (var i = 0; i < 4; i++)
            encodeNum(palette[i], 4, COMP_DATA_LEN);
        for (var i = 0; i < img.length; i++)
            imgMod.push(palette.indexOf(img[i]));
        encode(imgMod, 2, COMP_DATA_LEN);
        enc = encodeLast();
		maxPalette = 4;
    } else if (paletteCount <= 8) {
        encodeNum(2, 2, COMP_DATA_LEN);
        for (var i = 0; i < 8; i++)
            encodeNum(palette[i], 4, COMP_DATA_LEN);
        for (var i = 0; i < img.length; i++)
            imgMod.push(palette.indexOf(img[i]));
        encode(imgMod, 3, COMP_DATA_LEN);
        enc = encodeLast();
		maxPalette = 8;
    } else if (paletteCount <= 16) {
        encodeNum(3, 2, COMP_DATA_LEN);
        for (var i = 0; i < 16; i++)
            encodeNum(palette[i], 4, COMP_DATA_LEN);
        for (var i = 0; i < img.length; i++)
            imgMod.push(palette.indexOf(img[i]));
        encode(imgMod, 4, COMP_DATA_LEN);
        enc = encodeLast();
		maxPalette = 16;
    }
    enc = enc.replace("\"", "&quot;").replace("<", "&lt;").replace(">", "&gt;");
	enc += "<br/>";
	enc += `${paletteCount}/${maxPalette} colors used in palette`;
    saveText.innerHTML = enc;
}

function clearFill() {
    img = new Array(imgWidth * imgHeight).fill(selColor);
}

function handleInput() {
    if ((md || rmd) && (mx >= 0 && mx < imgWidth * PIXEL_SIZE && my >= 0 && my < imgHeight * PIXEL_SIZE)) {
        var drawColor = md ? selColor : sel2Color;
        var pixPosX = Math.floor(mx / PIXEL_SIZE);
        var pixPosY = Math.floor(my / PIXEL_SIZE);
        img[pixPosX + imgWidth * pixPosY] = drawColor;
        save();
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, imgWidth * PIXEL_SIZE, imgHeight * PIXEL_SIZE);
    for (var i = 0; i < imgHeight; i++) {
        for (var j = 0; j < imgWidth; j++) {
            var pix = imgPalette[img[j+i*imgWidth]];
            ctx.fillStyle = `rgb(${pix[0]},${pix[1]},${pix[2]})`;
            ctx.fillRect(j * PIXEL_SIZE, i * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
    for (var i = 0; i < imgHeight; i++) {
        for (var j = 0; j < imgWidth; j++) {
            var pix = imgPalette[img[j+i*imgWidth]];
            ctx.fillStyle = `rgb(${pix[0]},${pix[1]},${pix[2]})`;
            ctx.fillRect(j * 4, i * 4 + imgHeight*PIXEL_SIZE, 4, 4);
        }
    }

    var stxImg = scale2x(img, imgWidth, imgHeight);
    stxImg = scale2x(stxImg, imgWidth*2, imgHeight*2);
    pctx.fillStyle = "#000";
    pctx.clearRect(0, 0, imgWidth*4, imgHeight*4);
    for (var i = 0; i < imgHeight*4; i++) {
        for (var j = 0; j < imgWidth*4; j++) {
            var pix = imgPalette[stxImg[j+i*imgWidth*4]];
            pctx.fillStyle = `rgb(${pix[0]},${pix[1]},${pix[2]})`;
            pctx.fillRect(j * PIXEL_SIZE/4, i * PIXEL_SIZE/4, PIXEL_SIZE/4, PIXEL_SIZE/4);
        }
    }
    for (var i = 0; i < imgHeight*4; i++) {
        for (var j = 0; j < imgWidth*4; j++) {
            var pix = imgPalette[stxImg[j+i*imgWidth*4]];
            pctx.fillStyle = `rgb(${pix[0]},${pix[1]},${pix[2]})`;
            pctx.fillRect(j, i + imgHeight*PIXEL_SIZE, 1, 1);
        }
    }
}

function getPalette() {
    return [...new Set(img)];
}

function scale2x(img, width, height) {
    var srcSlices = [];
    var dstSlices = [];
    for (var i = 0; i < height; i++) {
        srcSlices.push(img.slice(i*width, (i+1)*width));
        dstSlices.push(new Array(width * 2).fill(0));
        dstSlices.push(new Array(width * 2).fill(0));
    }
    scale2xSlices(srcSlices, dstSlices, width, height);
    return dstSlices.flat();
}

function scale2xSlices(src, dst, width, height) {
    var sp = -1;
    var dp = 0;
    
    for (var i = 0; i < height; i++) {
        var f = (i == 0) ? 1 : 0;
        var l = (i == height - 1) ? -1 : 0;
        scale2xSlice(src[sp+f], src[sp+1], src[sp+l+2], dst[dp], dst[dp+1], width, height);
        sp++;
        dp += 2;
    }
}
function scale2xSlice(src0, src1, src2, dst0, dst1, width, height) {
    //var sp = 0;
    //var dp = 0;
    for (var i = 0; i < height; i++) {
        var f = (i == 0) ? 0 : -1;
        var l = (i == height - 1) ? 0 : 1;
        var sp = i;
        var dp = i*2;
        var src0Sp = src0[sp];
        var src1Sp = src1[sp];
        var src2Sp = src2[sp];
        if (src0Sp != src2Sp && src1[sp+f] != src1[sp+l]) {
            dst0[dp+0] = src1[sp+f] == src0Sp ? src0Sp : src1Sp;
            dst0[dp+1] = src1[sp+l] == src0Sp ? src0Sp : src1Sp;
            dst1[dp+0] = src1[sp+f] == src2Sp ? src2Sp : src1Sp;
            dst1[dp+1] = src1[sp+l] == src2Sp ? src2Sp : src1Sp;
        } else {
            dst0[dp+0] = src1Sp;
            dst0[dp+1] = src1Sp;
            dst1[dp+0] = src1Sp;
            dst1[dp+1] = src1Sp;
        }
        //sp++;
        //dp += 2;
    }
}

start();