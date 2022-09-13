var IMAGE_SIZE = 16;

var imgPalette = ["#000000ff","#1c2b53ff","#7f2454ff","#008751ff","#ab5236ff","#60584fff","#c3c3c6ff","#fff1e9ff","#ed1b51ff","#faa21bff","#f7ec2fff","#5dbb4dff","#51a6dcff","#83769cff","#00000000","#fcccabff"];

function getTexture(inp, width, height) {
    var pixImg = loadS2x(inp, width, height);
    return getPixTexture(pixImg, width, height);
}

function getFontTexture(inp) {
    var newInp = [];
    var pixImg = loadS2x(inp, 32, 20);
    for (var i = 0; i < 32*20; i++) {
        if (i % 32 == 0 && (Math.floor(i/32) % 5) == 0)
            newInp.push(...new Array(1+4*10+2).fill(14));
        if (((i % 32) % 3) == 0)
            newInp.push(14);
        newInp.push(pixImg[(i < 0) ? 0 : i]);
    }
    return getPixTexture(newInp, 1+4*10+2, 1+4*10+2);
}

function getPixTexture(pixImg, width, height) {
	var tex = gl.createTexture();
    //var pctx = createCanvas(width*4, height*4);
    //drawS2x(pctx[1], pixImg, width, height);
	gl.bindTexture(GL_TEXTURE_2D, tex);
    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width*4, height*4, 0, GL_RGBA, GL_UNSIGNED_BYTE, get2DTexture(pixImg, width, height));
	gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    //console.log(pctx[0].toDataURL());
    return tex;
}

function get2DTexture(pixImg, width, height) {
    var pctx = createCanvas(width*4, height*4);
    drawS2x(pctx[1], pixImg, width, height);
    return pctx[0];//.toDataURL();
}

function createCanvas(width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return [canvas, canvas.getContext("2d")];
}

function loadS2x(inp, width, height) {
    load(inp);
    var size = decode(2)+1;
    var palette = [];
    var img = new Array(width*height);
    for (var i = 0; i < (2**size); i++) {
        palette[i] = decode(4);
    }
    for (var i = 0; i < img.length; i++) {
        img[i] = palette[decode(size)];
    }
    return img;
}

function drawS2x(pctx, img, width, height) {
    var stxImg = scale2x(img, width, height);
    stxImg = scale2x(stxImg, width*2, height*2);
    for (var i = 0; i < height*4; i++) {
        for (var j = 0; j < width*4; j++) {
            pctx.fillStyle = imgPalette[stxImg[j+i*width*4]];
            pctx.fillRect(j, i, 1, 1);
        }
    }
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
    for (var i = 0; i < width; i++) {
        var f = (i == 0) ? 0 : -1;
        var l = (i == width - 1) ? 0 : 1;
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