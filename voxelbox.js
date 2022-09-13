/*
var scenes = [];
var sceneModels = [];

function twoChar(arr, idx, diff) {
	return (arr[idx] << 4) | arr[idx+(diff||1)];
}

function twoCharStr(str) {
	return (alphaParseInt(str[0]) << 4) | alphaParseInt(str[1]);
}

function alphaParseInt(str) {
	return parseInt(str, 26+10) - 10;
}








function voxelize(data) {
	var cubeNorms = [0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,
	                 0,-1,0,0,-1,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,
					 0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,
					 0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0];

    var d = data.split("").map(n => alphaParseInt(n));
    var matCnt = d[6];
    var voxDataStart = matCnt*3 + 7;
    var voxDataLen = d.length - voxDataStart;
    var voxDataBlockCnt = voxDataLen / 13;
    var voxDataBlockLen = 6 * voxDataBlockCnt;
	var verts = [];
    var norms = [];
    var colrs = [];

    var mats = [];
    var i,j,c = 0;
    var ver;
    var hx = twoChar(d, 0)/2/10;
    var hz = twoChar(d, 2)/2/10;
    var hy = twoChar(d, 4)/2/10;
	
    for (i = 0; i < matCnt*3; i += 3) {
        mats.push([d[i+7],d[i+8],d[i+9]]);
    }
	
	for (i = voxDataStart; i < voxDataStart+voxDataBlockCnt; i++) {
		var x1 = twoChar(d, i + voxDataBlockCnt*0, voxDataBlockLen);
		var z1 = twoChar(d, i + voxDataBlockCnt*1, voxDataBlockLen);
		var y1 = twoChar(d, i + voxDataBlockCnt*2, voxDataBlockLen);
		var x2 = twoChar(d, i + voxDataBlockCnt*3, voxDataBlockLen);
		var z2 = twoChar(d, i + voxDataBlockCnt*4, voxDataBlockLen);
		var y2 = twoChar(d, i + voxDataBlockCnt*5, voxDataBlockLen);
		
		var mat = mats[d[i + voxDataBlockLen*2]];
		
		ver = createCubeOfDims(0.0+x1/-10+hx,
		                       0.0+y1/ 10-hy,
		                       0.0+z1/ 10-hz,
		                      -0.1+x2/-10+hx,
		                       0.1+y2/ 10-hy,
		                       0.1+z2/ 10-hz);
		for (j = 0; j < 72; j++) {
		    verts[j+(c*72)] = ver[j];
		}
		if (mat[0] == 8) mat[0] = 80;
		if (mat[1] == 8) mat[1] = 80;
		if (mat[2] == 8) mat[2] = 80;
		norms = norms.concat(cubeNorms);
		for (j = 0; j < 24; j++) {
		    colrs = colrs.concat([
		        (mat[0]+0.05)/8,(mat[1]+0.05)/8,(mat[2]+0.05)/8,1
		    ]);
		}
		c++;
	}
    var indcs = createIndiciesOfCount(verts.length/12);

    return loadWgm({v:verts,i:indcs,n:norms,c:colrs}, shaderHouse.main3d);
}
function createIndiciesOfCount(count) {
    var array = new Array(count*6);
    for (var i = 0; i < count*4; i+=4) {
        for (var j = 0; j < 6; j++) {
            array[i/4*6+j] = i+[0,1,2,0,2,3][j];
        }
    }
    return array;
}
function createCubeOfDims(x1,y1,z1,x2,y2,z2) {
    return [
        //top z+
        x1,y1,z2,
        x2,y1,z2,
        x2,y2,z2,
        x1,y2,z2,
        //bottom z-
        x1,y1,z1,
        x2,y1,z1,
        x2,y2,z1,
        x1,y2,z1,
        //front x+
        x2,y1,z1,
        x2,y2,z1,
        x2,y2,z2,
        x2,y1,z2,
        //back x-
        x1,y2,z1,
        x1,y1,z1,
        x1,y1,z2,
        x1,y2,z2,
        //right y+
        x2,y2,z1,
        x1,y2,z1,
        x1,y2,z2,
        x2,y2,z2,
        //left y-
        x1,y1,z1,
        x2,y1,z1,
        x2,y1,z2,
        x1,y1,z2
    ];
}
function generateScene(sceneData, modelData) {
    var len = twoCharStr(sceneData);
    var posData = sceneData.substr(2, len*(2*3)).match(/../g).map(n => twoCharStr(n));

    var idxStart = sceneModels.length;
    var idxCur = 0;
    var mdlIdxs = [];
	
	sceneModels = sceneModels.concat(modelData);
    sceneData.slice(2 + len*(2*3)).match(/./g).map(n => {
        mdlIdxs.push(idxStart+alphaParseInt(n));
        //mdlIdxs = mdlIdxs.concat(Array(alphaParseInt(n)).fill(idxStart+(idxCur++)));
    });
    
	var offsetOdds = (mdlIdx, dir) => {
		return (twoChar(sceneModels[mdlIdx], 2*dir)/10)&1?0.5:0;
	};
	
    var s = [];
    for (var i = 0; i < posData.length; i += 3) {
		var mdlIdx = mdlIdxs[i/3];
        s.push({x:posData[i], y:posData[i+1], z:posData[i+2], m:mdlIdx, ox:offsetOdds(mdlIdx, 0), oy:offsetOdds(mdlIdx, 1), oz:offsetOdds(mdlIdx, 2)});
    }
    scenes.push(s);
}

function loadScene(sceneIdx) {
    if (sceneIdx == -1) return;
    scenes[sceneIdx].forEach(s => {
        addObj(sceneModels[s.m], tfm((s.x-128+s.ox)/-10, (s.z-128+s.oz)/10, (s.y-128+s.oy)/10, 0,0,0, 1,1,1));
    });
}
*/


var cubeNorms = [
    0,0,1,0,0,1, 0,0,1,0,0,1,
	0,0,-1,0,0,-1, 0,0,-1,0,0,-1,
	1,0,0,1,0,0, 1,0,0,1,0,0,
	-1,0,0,-1,0,0, -1,0,0,-1,0,0,
	0,1,0,0,1,0, 0,1,0,0,1,0,
	0,-1,0,0,-1,0, 0,-1,0,0,-1,0
];

function createIndiciesOfCount(count) {
    var array = new Array(count*6);
    for (var i = 0; i < count*4; i+=4) {
        for (var j = 0; j < 6; j++) {
            array[i/4*6+j] = i+[0,1,2,0,2,3][j];
        }
    }
    return array;
}

function createCubeOfDims(x1,y1,z1,x2,y2,z2) {
    return [
        //top z+
        x1,y1,z2,
        x2,y1,z2,
        x2,y2,z2,
        x1,y2,z2,
        //bottom z-
        x1,y1,z1,
        x2,y1,z1,
        x2,y2,z1,
        x1,y2,z1,
        //front x+
        x2,y1,z1,
        x2,y2,z1,
        x2,y2,z2,
        x2,y1,z2,
        //back x-
        x1,y2,z1,
        x1,y1,z1,
        x1,y1,z2,
        x1,y2,z2,
        //right y+
        x2,y2,z1,
        x1,y2,z1,
        x1,y2,z2,
        x2,y2,z2,
        //left y-
        x1,y1,z1,
        x2,y1,z1,
        x2,y1,z2,
        x1,y1,z2
    ];
}

function voxelize(s) {
    load(s);

    var rsz = 10;

    var verts = [];
    var norms = [];
    var colrs = [];

    var mats = [];
    var ver;
    var hx = decode(5);
    var hz = decode(5);
    var hy = decode(5);

    hx = hx/2/rsz;
    hy = hy/2/rsz;
    hz = hz/2/rsz;

    var matCnt = decode(5);
    var volCnt = decode(5);

    for (var i = 0; i < matCnt; i++) {
        mats.push([decode(5), decode(5), decode(5)]);
    }

    for (var i = 0; i < volCnt; i++) {
        var x1 = decode(5);
        var z1 = decode(5);
        var y1 = decode(5);
        var x2 = decode(5);
        var z2 = decode(5);
        var y2 = decode(5);

        var matIdx = decode(5);
        var mat = mats[matIdx];
        //console.log(x1 + " " + z1 + " " + y1 + " > " + x2 + " " + z2 + " " + y2 + "|" + matIdx);

        ver = createCubeOfDims(
            0.0+x1/-rsz+hx, 0.0+y1/rsz-hy, 0.0+z1/rsz-hz,
            -0.1+x2/-rsz+hx, 0.1+y2/rsz-hy, 0.1+z2/rsz-hz
        );
        for (var j = 0; j < 72; j++) {
            verts.push(ver[j]);
        }
        norms = norms.concat(cubeNorms);
        for (var j = 0; j < 24; j++) {
            colrs = colrs.concat([
                (mat[0]+1)/16,(mat[1]+1)/16,(mat[2]+1)/16,1
            ]);
        }
    }
    var indcs = createIndiciesOfCount(verts.length/12);
    return loadWgm({v:verts,
		i:indcs,
		c:colrs,
		n:norms
	}, shaderHouse.main3d);
    //return createGlMdl(verts, indcs, norms, colrs);
}