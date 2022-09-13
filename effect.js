//#region shadows
var shadowTs;
var shadowFov = 20;
var depthMapFbo, depthMapTex;
var shadowVm, shadowProj;
var lightTfm = [0,0,0,0,0];
var lightMat = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
function setupShadows() {
	//https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/3.1.3.shadow_mapping/shadow_mapping.cpp
	
	shadowTs = 4096;//Math.min(8192, gl.getParameter(GL_MAX_TEXTURE_SIZE));

	depthMapFbo = gl.createFramebuffer();
	depthMapTex = gl.createTexture();
	gl.bindTexture(GL_TEXTURE_2D, depthMapTex);
	gl.texImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT32F, shadowTs, shadowTs, 0, GL_DEPTH_COMPONENT, GL_FLOAT, null);
	gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	gl.bindFramebuffer(GL_FRAMEBUFFER, depthMapFbo);
		gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMapTex, 0);
		gl.drawBuffers([GL_NONE]);
		gl.readBuffer(GL_NONE);
	gl.bindFramebuffer(GL_FRAMEBUFFER, null);

	gl.useProgram(shaderHouse.main3d.prog);
	gl.uniform1i(shaderHouse.main3d.shadowTex, 0);

	//gl.useProgram(shaderHouse.lava.prog);
	//gl.uniform1i(shaderHouse.lava.shadowTex, 0);

    shadowVm = new Float32Array(lookAtFps([0,0,0],0,0));
    shadowProj = new Float32Array(orthoProjection(-shadowFov, shadowFov, -shadowFov, shadowFov));

	//setLightPos(7.4, 29.1, 5.56, -1.1, -5.1);
	setLightPos(0.16, 19.6, -17.6, -0.65, -3.1);
}
function setLightPos(x,y,z,a,b) {
	lightTfm = [x,y,z,a,b];
	var shadowVmArr = lookAtFps([x,y,z],a,b);
	shadowVm = Float32Array.of(...shadowVmArr);
	lightMat = Float32Array.of(...dot(orthoProjection(-shadowFov, shadowFov, -shadowFov, shadowFov), shadowVmArr));
}
//#endregion

//#region sprites/billboards
function createSpriteModel(shader, texture) {
	let webglModel = loadWgm({v:[-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0],
		i:[0,1,2, 0,2,3],
		c:[0,1,1,1, 1,1,1,1, 1,0.01,1,1, 0,0.01,1,1],
		n:[0,1,0, 0,1,0, 0,1,0, 0,1,0]
	}, shader);
	if (texture != undefined) {
		webglModel.tex = getTexture(texture, 16, 16);
	}
	return webglModel;
}
//#endregion

//#region chat bubble
var wgmChatBox = [];
var wgmChatChars = [];
var visibleChatBoxes = [];
function setupChat() {
	for (var i = 0; i < 2; i++) {
		wgmChatBox.push(loadWgm({v:[-0.4,-0.4,0, 0.4,-0.4,0, 0.4,0.4,0, -0.4,0.4,0],
			i:[0,1,2, 0,2,3],
			c:[0,1,1,1, 1,1,1,1, 1,0,1,1, 0,0,1,1],
			n:[0,1,0, 0,1,0, 0,1,0, 0,1,0]
		}, shaderHouse.main3d));
		wgmChatBox[i].tex = getTexture(i == 0 ? data.speechLeft : data.speechRight, 16, 16);	
	}
	var fontTex = getFontTexture(data.font);
	for (var i = 0; i < 10*4+1; i++) {
		var x = i % 10;
		var y = Math.floor(i / 10);
		var x1 = (4 + x * 16) / 172;
		var y1 = (4 + y * 24) / 172;
		var x2 = (4 + x * 16 + 12) / 172;
		var y2 = (4 + y * 24 + 20) / 172;
		wgmChatChars.push(loadWgm({v:[-0.02,-0.03,0, 0.02,-0.03,0, 0.02,0.03,0, -0.02,0.03,0],
			i:[0,1,2, 0,2,3],
			c:[x2,y2,1,1, x1,y2,1,1, x1,y1,1,1, x2,y1,1,1],
			n:[0,1,0, 0,1,0, 0,1,0, 0,1,0]
		}, shaderHouse.main3d));
		wgmChatChars[i].tex = fontTex;
	}
}

function showChat(trans, text) {
	var pack = [];
	for (var i = 0; i < 2; i++) {
		var obj = addObj(wgmChatBox[i], dot(trans, tfm(i ? 0 : -0.4,0.9,0, 0,0,0, 1,1,1)));
		pack.push(obj);
	}
	pack.push([]);
	pack.push(trans);
	pack.push(text);
	pack.push(0);
	visibleChatBoxes.push(pack);
}

function showChatChar(char, trans, x, y) {
	var charIdx = wgmChatChars["abcdefghijklmnopqrstuvwxyz.',?0123456789 ".indexOf(char)];
	return addObj(
		charIdx, dot(trans, tfm(0.22-x*0.05,0.15+0.9-y*0.08,-0.01, 0,0,0, 1,1,1))
	);
}

function updateChat() {
	for (var i = 0; i < visibleChatBoxes.length; i++) {
		var vcb = visibleChatBoxes[i];
		var trans = vcb[3];
		var text = vcb[4];
		var pos = vcb[5];
		if (pos < text.length) {
			vcb[2].push(showChatChar(text[pos], trans, pos % 18, Math.floor(pos / 18)));
		}
		vcb[5]++;
		//remove chatbox after time period
		if (vcb[5] > text.length + 300) {
			removeObj(vcb[0]);
			removeObj(vcb[1]);
			vcb[2].forEach(o => removeObj(o));
		}
	}
}

function clearChat() {
	for (var i = 0; i < visibleChatBoxes.length; i++) {
		var vcb = visibleChatBoxes[i];
		removeObj(vcb[0]);
		removeObj(vcb[1]);
		vcb[2].forEach(o => removeObj(o));
	}
	visibleChatBoxes = [];
}
//#endregion