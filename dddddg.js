var update = updateMaingame;

var objBoat, objCur, objDock;
var objGhosts = [];
var objTerrains = {};
var objScenery = {};

var wwWgmTerr;
var wwWgmTerrAvail = true;

var wgmLava;
var wgmObsts;
var wgmDock;
var terrgen;

var boatPos = [-0.3, -0.1];
//var boatPos = [152.40281255369266, 3.7384198653183116];
//var boatPos = [17.47437278338057, -1.9190605001185457];
var boatAcl = [0, 0, 0];
var boatRot = 2.5;
var boatMvt = 0;
var boatLastCache = [];
var collideAnim = 0;

var dockZoom = 0;
var dockManTop, dockManBot;
var dockItemIcons = [];

var dockActive = false;
var dockItemChoices = [];
var dockItemPrices = [0,65,20,40,25,50,30];
var dockItemPlaceWait = 300;
var dockItemHovered = 1;
var dockItemObjs = [];
var dockItemForwardPoses = [];
var dockMode = 0; // 0: browsing, 1: show price, 2: purchasing, 3: locked

var terrainCollis = {};

var soulPower = 1;
var memories = 0;

var purchasedItems = [];
var invItemIcons = [];

var ghostSprites = [];
var mouse1Sprite, mouse2Sprite, mouse1SelSprite;
var soul2dSprite, memorySprite, riverMapSprite;

var [mx,my,amx,amy,dmx,dmy] = [0,0,0,0,0,0];
var mouseMode = 1; // 0: grab, 1: row

var introTime = 0;
var deathTime = 0;

var zzfx, zzfxV, zzfxX;
var soundInitialized = false;

const INV_ITEM_MAGNET = 1;
const INV_ITEM_SHIELD = 2;
const INV_ITEM_SPEED = 3;
const INV_ITEM_BAG = 4;
const INV_ITEM_DARKGHOST = 5;
const INV_ITEM_RIVERMAP = 6;

function start() {
	startGame();

	// terrain
	wwWgmTerr = createWorker(DiamondSquare, [clamp, getRiverXPos, subVec, addVec, flipVec, lenVec, normVec, randPrngSeed]);
	// ///////
	
	// boat
	var wgmBoat = voxelize(data.worldBoat);
	var wgmBoatShortEdge = voxelize(data.worldBoatShortEdge);
	var wgmBoatLongEdge = voxelize(data.worldBoatLongEdge);

	objBoat = addObj(wgmBoat, tfm(0,3.7,-0.36, 0,-0.41,0, 0.1,0.1,0.1));
	objBoat.chd.push(makeObj(wgmBoatShortEdge, tfm(0.9,-0.05,0, 0,0,pi/4)));
	objBoat.chd.push(makeObj(wgmBoatShortEdge, tfm(-0.9,-0.05,0, 0,0,pi/4)));
	objBoat.chd.push(makeObj(wgmBoatLongEdge, tfm(0,-0.05,0.4, pi/4,0,0)));
	objBoat.chd.push(makeObj(wgmBoatLongEdge, tfm(0,-0.05,-0.4, pi/4,0,0)));
	// ////

	// lava
	wgmLava = loadWgm({v:[0,0,-16, 25.5,0,-16, 25.5,0,16, 0,0,16],
		i:[0,1,2, 0,2,3],
		c:[1,1,1,1, 1,1,1,1, 1,0,1,1, 1,1,1,1],
		n:[0,1,0, 0,1,0, 0,1,0, 0,1,0]
	}, shaderHouse.lava);
	// ////

	// ghosts
	[
		data.ghostwhite1, data.ghostwhite2,
		data.ghostblue1, data.ghostblue2,
		data.ghostred1, data.ghostred2,
		data.ghostyellow1, data.ghostyellow2,
		data.ghostpurple1, data.ghostpurple2
	].forEach(d => {
		ghostSprites.push(getTexture(d, 16, 16));
	});
	// //////

	// obstacles
	wgmObsts = [
		voxelize(data.obst1),
		voxelize(data.obst2),
		voxelize(data.obst3)
	];
	// /////////

	// dock
	setupChat();
	wgmDock = voxelize(data.dock);
	dockManTop = makeObj(createSpriteModel(shaderHouse.main3d, data.dockmantop), tfm(0,0.34,0, 0,pi/2+pi/4,0, 0.3,0.3,0.3));
	dockManBot = makeObj(createSpriteModel(shaderHouse.main3d, data.dockmanbot), tfm(0,0.05,0, 0,pi/2+pi/4,0, 0.3,0.3,0.3));

	[
		data.itemBg,
		data.itemMagnet,
		data.itemShield,
		data.itemSpeed,
		data.itemBag,
		data.itemDarkGhost,
		data.itemRiverMap,
		data.itemAccept,
		data.itemCancel
	].forEach(d => {
		dockItemIcons.push(getTexture(d, 16, 16));
		invItemIcons.push(get2DTexture(loadS2x(d, 16, 16), 16, 16));
	});
	// ////

	// cursor
	mouse1Sprite = getTexture(data.cursor1, 16, 16);
	mouse2Sprite = getTexture(data.cursor2, 16, 16);
	mouse1SelSprite = getTexture(data.cursor1Sel, 16, 16);
	objCur = makeObj(createSpriteModel(shaderHouse.main3d, undefined), tfm(0,0.9,0, 0,pi/2,0));
	objCur.wgm.tex = mouse1Sprite;
	setCursorObjParent(true);
	// //////

	// 2d
	soul2dSprite = get2DTexture(loadS2x(data.ghostwhite1, 16, 16), 16, 16);
	memorySprite = get2DTexture(loadS2x(data.memory, 16, 16), 16, 16);
	riverMapSprite = get2DTexture(loadS2x(data.itemRiverMap, 16, 16), 16, 16);
	// //
}

function updateMaingame() {
	updateDock();
	updateBoat();
	updateGhosts();
	updateCursor();
	updateTerrain();
	updateLighting();
	update2D();
	updateCollision();
	updateChat();
	updateSound();
	//handleDebugCameraControls();
}

// RESET
function resetGame() {
	for (let chunk in objTerrains) { // actually "in", not "of"
		removeTerrain(chunk);
	}
	for (let ghost of objGhosts) {
		removeObj(ghost);
	}

	soulPower = 1;
	memories = 0;
	dockActive = false;
	dockZoom = 0;
	boatAcl = [0,0,0];
	boatPos = [boatPos[0] + 10, 0];
	boatPos[1] = getRiverXPos(boatPos[0]*10)*15;
}

// DOCK

function updateDock() {
	if (objDock == undefined) {
		return;
	}

	let zoomTarget = 0;
	if (lenVec(subVec(tfmPositionVec(objBoat.tfm), tfmPositionVec(objDock.tfm))) < 2.3) {
		zoomTarget = 1;
	}

	dockZoom += (zoomTarget - dockZoom) * 0.1;

	if (dockZoom > 0.9 && !dockActive) {
		if (mouseMode == 0) {
			setCursorObjParent(false);
		}
		dockActive = true;
		dockMode = -1;
		dockItemPlaceWait = 100;
		showChat(objDock.tfm, "you seem like you could use an      upgrade. anything look appealing?");
		dockItemForwardPoses = [0,0,0];
	} else if (dockZoom < 0.3 && dockActive) {
		setCursorObjParent(true);
		dockActive = false;
		removeDockItems();
	}

	if (dockActive) {
		dockItemPlaceWait--;
		if (dockItemPlaceWait > 0) {
			return;
		}

		if (dockMode == -1 && dockItemPlaceWait == 0) {
			placeDockItems();
			dockMode = 0;
		}
		if (mouseMode == 1) {
			return;
		}

		if (dockMode == 0) {
			let curItemHovered = Math.floor((mx+0.5)*-1.99);
			for (let i = 0; i < 3; i++) {
				dockItemForwardPoses[i] = Math.max(((curItemHovered == i ? 1 : 0) - dockItemForwardPoses[i]) * 0.4, 0);
				dockItemObjs[i*2].tfm[14] = 0.2-0.6*dockItemForwardPoses[i];
			}
			if (curItemHovered != dockItemHovered && curItemHovered >= 0 && curItemHovered <= 2) {
				dockItemHovered = curItemHovered;
	
				let itemDescs = [
					"",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"sucks in white    ghosts who are    close to you. justa warning though, it's pretty weak.",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"protects you when you accidently runinto obstacles in the way.",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"helps you row     faster. you're    here for eternity though so this maynot be useful.",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"lets you holds    more memories. i  like this since   it's more money   for me.",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"hold more soul    power. now you cango further without stopping for more soul.",
				  //"aaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbccccccccccccccccccddddddddddddddddddeeeeeeeeeeeeeeeeee"
					"river map. now youcan see if i'm    just around the   corner.",
				];
	
				clearChat();
				showChat(objDock.tfm, itemDescs[dockItemChoices[dockItemHovered]]);
			}
		} else if (dockMode == 1) {
			dockMode = 0;
		}
	}
}

function placeDockItems() {
	function createDockSprite(spritePos, tex) {
		let wgmItem = createSpriteModel(shaderHouse.main3d, undefined);
		wgmItem.tex = tex;
		let objItem = makeObj(wgmItem, spritePos);
		objDock.chd.push(objItem);
		dockItemObjs.push(objItem);
	}

	for (let i = 0; i < 3; i++) {
		let spriteAndBg = [dockItemIcons[dockItemChoices[i]], dockItemIcons[0]];
		for (let j = 0; j < 2; j++) {
			let itemPos = tfm(0.5+i/2,0.34,0.2+j*0.01, 0,pi,0, 0.3,0.3,0.3);
			createDockSprite(itemPos, spriteAndBg[j]);
		}
	}

	[
		[tfm(0.8,-100/*0.7*/,0.2, 0,pi,0, 0.4,0.4,0.4), dockItemIcons[7]],
		[tfm(1.2,-100/*0.7*/,0.2, 0,pi,0, 0.4,0.4,0.4), dockItemIcons[8]]
	].forEach(i => {
		createDockSprite(i[0], i[1]);
	})
}

function removeDockItems() {
	dockItemObjs.forEach(o => arrRemove(objDock.chd, o));
	dockItemObjs = [];
}

function setCursorObjParent(toBoat) {
	arrRemove(objBoat.chd, objCur);
	if (objDock != undefined) {
		arrRemove(objDock.chd, objCur);
	}
	if (toBoat) {
		objBoat.chd.push(objCur);
	} else {
		objDock.chd.push(objCur);
	}
}

// BOAT

function updateBoat() {
	let boatRock = Math.sin((collideAnim)/3)*0.09*(collideAnim/56);
	objBoat.tfm = tfm(boatPos[0],3.7,boatPos[1], boatRock,boatRot,boatRock, 0.1,0.1,0.1);

	boatLastCache.push(objBoat.tfm);
	if (boatLastCache.length > 4) {
		boatLastCache.shift();
	}

	let camMatTfm = dot(boatLastCache[0], tfm(lerp(6,14,dockZoom),lerp(4,9,dockZoom),0));
	cam.x = camMatTfm[12];
	cam.y = camMatTfm[13];
	cam.z = camMatTfm[14];
	cam.a = -0.25;
	cam.b = -Math.atan2(objBoat.tfm[14]-camMatTfm[14], objBoat.tfm[12]-camMatTfm[12]) - pi / 2;

	if (keysDown[37]) {
		boatRot += 0.01;
	} else if (keysDown[39]) {
		boatRot -= 0.01;
	}

	const VELOCITY_CAP = 0.04;
	let boatAclVec = [boatAcl[0], boatAcl[1], 0];
	if (lenVec(boatAclVec) > VELOCITY_CAP) {
		boatAclVec = mulVec(normVec(boatAclVec), [VELOCITY_CAP,VELOCITY_CAP,VELOCITY_CAP]);
	}

	boatAcl[0] = boatAclVec[0];
	boatAcl[1] = boatAclVec[1];

	boatPos[0] += boatAcl[0];
	boatPos[1] += boatAcl[1];
	boatRot += boatAcl[2];
	boatAcl[0] *= 0.98;
	boatAcl[1] *= 0.98;
	boatAcl[2] *= 0.98;

	// if not near dock
	if (dockZoom < 0.9) {
		let riverDir = getRiverDir(boatPos[0]);
		boatAcl[0] += Math.sin(riverDir) * 0.0001;
		boatAcl[1] += Math.cos(riverDir) * 0.0001;
		boatAcl[2] += (riverDir - boatRot + pi/2) * 0.0001;
	}
}

// GHOSTS

function updateGhosts() {
	for (let objGhost of objGhosts) {
		let boatOffX = objBoat.tfm[12] + Math.cos(objGhost.seed * 123) * 0.1;
		let boatOffZ = objBoat.tfm[14] + Math.sin(objGhost.seed * 123) * 0.1;

		let distToBoat = distVec(tfmPositionVec(objGhost.tfm), tfmPositionVec(objBoat.tfm));
		if (hasMagnetPower() && distToBoat < 1.2) {
			objGhost.magDist -= distToBoat * 0.008;
		} else {
			objGhost.magDist += distToBoat * 0.008;
		}

		objGhost.magDist = clamp(0, objGhost.magDist, 1);

		objGhost.time += objGhost.speed;

		objGhost.tfm[12] = lerp(boatOffX, objGhost.time*0.002 + objGhost.riverYPos, objGhost.magDist);
		objGhost.tfm[14] = lerp(boatOffZ, (getRiverXPos(objGhost.tfm[12]*10)*15) + (objGhost.seed-0.5), objGhost.magDist);

		objGhost.tfm[13] = objGhost.startPos + Math.sin(objGhost.time / 130 + objGhost.seed * 123) * 0.07;

		if ((objGhost.time + objGhost.seed * 12345) % 28 < 14) {
			objGhost.wgm.tex = ghostSprites[0 + objGhost.type*2];
		} else {
			objGhost.wgm.tex = ghostSprites[1 + objGhost.type*2];
		}
	}
}

// CURSOR

function updateCursor() {
	amx *= 0.7; amy *= 0.7;

	if (mouseDown[2] || keysDown[32]) {
		mouseMode = 1 - mouseMode;
		mouseDown[2] = false;
		keysDown[32] = false;
		if (dockActive) {
			if (mouseMode == 0) {
				setCursorObjParent(false);
			} else {
				setCursorObjParent(true);
			}
		}
	}
	if (mouseMode == 1) {
		objCur.wgm.tex = mouse2Sprite;
		objCur.tfm = tfm((my+amy),0.5-(mouseDown[0]?0.2:0),-(mx+amx), 0,pi/2,0, 0.5,0.5,0.5);
		if (mouseDown[0]) {
			soulPower -= Math.sqrt(amx**2+amy**2) * getSoulUsageMultiplier();
			boatAcl[0] += Math.cos(-boatRot) * (-dmy/50) * 0.4;
			boatAcl[1] += Math.sin(-boatRot) * (-dmy/50) * 0.4;
			boatAcl[2] += dmx * 0.005;

			boatAcl[0] += Math.cos(-boatRot) * (-amy/50) * 0.07;
			boatAcl[1] += Math.sin(-boatRot) * (-amy/50) * 0.07;
			boatAcl[2] += amx * 0.001;
		}
		if (mouseJustDown[0]) {
			if (zzfx != undefined) {
				zzfx(...[.1,0,750,.04,,.4,4,3.7,.3,.2,,,.11,2,,,.2,1.1,.03,.01]);
			}
		}
	} else {
		objCur.wgm.tex = mouse1Sprite;
		if (dockActive) {
			objCur.tfm = tfm(-(mx+amx)-0.3,-(my+amy)+0.9,0, 0,pi,0, 0.2,0.2,0.2);

			if (mouseJustDown[0]) {
				let itemChoice = dockItemChoices[dockItemHovered];
				let price = dockItemPrices[itemChoice];
				if (dockMode == 0) {
					clearChat();
					if (purchasedItems.includes(itemChoice)) {
						dockMode = 1;
						showChat(objDock.tfm, "you already own   this ...");
						dockItemPlaceWait = 120;
					} else if (price > memories) {
						dockMode = 1;
						showChat(objDock.tfm, `this item is ${price}   memories but you  only have             ${memories} memories`);
						dockItemPlaceWait = 120;
					} else {
						dockMode = 2;
						showChat(objDock.tfm, `are you sure you  want to buy this  for ${price} memories?`);
						dockItemObjs[6].tfm[13] = 0.7;
						dockItemObjs[7].tfm[13] = 0.7;
					}
				} else if (dockMode == 2) {
					if (mx < -1.2) {
						dockMode = 0;
						dockItemObjs[6].tfm[13] = -100;
						dockItemObjs[7].tfm[13] = -100;
					} else {
						memories -= price;
						dockMode = 3;
						purchasedItems.push(itemChoice);
						removeDockItems();
						clearChat();
						showChat(objDock.tfm, "thank you for your business.");
					}
				}
			}
		} else {
			objCur.tfm = tfm(0,-(my+amy)+0.9,-(mx+amx), 0,pi/2,0, 0.5,0.5,0.5);

			let globalCursorMatrix = dot(objBoat.tfm, objCur.tfm);
			if (mouseDown[0]) {
				for (let i = objGhosts.length; i--;) {
					let objGhost = objGhosts[i];
					let distToCur = Math.sqrt((globalCursorMatrix[12]-objGhost.tfm[12])**2 + (globalCursorMatrix[14]-objGhost.tfm[14])**2);
					if (distToCur < 0.8) {
						if (zzfx != undefined) {
							zzfx(...[0.4,,125,.02,.04,.09,3,1.96,,-0.9,,,,,,,.19,.99,.07,.01]);
						}
						soulPower += 0.06;
						soulPower = Math.min(1, soulPower);
						objGhosts.splice(i, 1);
						if (objGhost.type != 0) {
							memories += objGhost.type * 2;
							memories = Math.min(getMemoryCap(), memories);
						}
						removeObj(objGhost);
					}
				}
			} else {
				let anyGhostClose = false;
				for (let objGhost of objGhosts) {
					let distToCur = Math.sqrt((globalCursorMatrix[12]-objGhost.tfm[12])**2 + (globalCursorMatrix[14]-objGhost.tfm[14])**2);
					if (distToCur < 0.8) {
						anyGhostClose = true;
						break;
					}
				}
				if (anyGhostClose) {
					objCur.wgm.tex = mouse1SelSprite;
				}
			}
		}
	}
}

// COLLISION

function updateCollision() {
	for (let sceneryGroup in objScenery) {
		//let zzz = 0;
		objScenery[sceneryGroup].forEach(obj => {
			if (obj.type < 0) {
				return;
			}
			let collisWidth  = [15,  7, 7][obj.type]/100;
			let collisHeight = [12, 10, 4][obj.type]/100;
			let boatRotPos = rotatePointToRect(boatPos[0] - obj.tfm[12], boatPos[1] - obj.tfm[14], -obj.crot);
			let collides = rectCircleColliding(0, 0, collisWidth, collisHeight, boatRotPos[0], boatRotPos[1], 0.18);
			//ctx.fillStyle=["#500","#050","#005","#055","#ccc"][zzz];
			//let x = obj.tfm[12] * 50 + 150 - collisWidth*200;
			//ctx.fillRect(0, obj.tfm[14] * 50 + 250 - collisHeight*200, collisWidth*400, collisHeight*400);
			//ctx.fillStyle=["#f00","#0f0","#00f","#0ff","#ccc"][zzz];
			//ctx.fillRect((boatRotPos[0] + obj.tfm[12]) * 50 + 150 - 6 - x, (boatRotPos[1] + obj.tfm[14]) * 50 + 250 - 6, 12, 12);
			//ctx.fillText(obj.crot + "/" + (boatPos[0] - obj.tfm[12]) + "/" + (boatPos[1] - obj.tfm[14]), 600, obj.tfm[14] * 50 + 250 - collisHeight*200);
			if (collides && collideAnim == 0) {
				soulPower -= getObstacleSoulLoss();
				collideAnim = 18*pi;
				if (zzfx != undefined) {
					zzfx(...[.4,,300,.03,.09,.41,4,0,,,,,,.1,55,.4,,.5,.09,.18]);
				}
			}
			//zzz++;
		});
	}

	if (collideAnim > 0) {
		collideAnim--;
	} else {
		collideAnim = 0;
	}
}

function rotatePointToRect(cx, cy, ang) {
	return [
		cx * Math.cos(ang) - cy * Math.sin(ang),
		cx * Math.sin(ang) + cy * Math.cos(ang)
	];
}

// https://stackoverflow.com/a/1879223
function rectCircleColliding(rx, ry, rw, rh, cx, cy, cr) {
	// Find the closest point to the circle within the rectangle
	let closestX = clamp(rx, cx, rx+rw);
	let closestY = clamp(ry, cy, ry+rh);

	// Calculate the distance between the circle's center and this closest point
	let distanceX = cx - closestX;
	let distanceY = cy - closestY;

	// If the distance is less than the circle's radius, an intersection occurs
	let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
	return distanceSquared < (cr * cr);
}

// TERRAIN

function updateTerrain() {
	let chunkIdx = Math.floor(boatPos[0] / 25.4 - 0.5);

	// current
	placeTerrainAndRemoveLast(chunkIdx);
	// ahead
	placeTerrainAndRemoveLast(chunkIdx + 1);

	// collide boat with terrain
	let chunkIdxCollis = Math.floor(boatPos[0] / 25.4);
	let chunkOffCollis = Math.floor(((boatPos[0] * 10) % 254) * 256/254);
	//console.log(chunkIdxCollis, chunkOffCollis);
	let terrainBounds = terrainCollis[chunkIdxCollis];
	if (terrainBounds != undefined) {
		terrainBounds = terrainBounds[chunkOffCollis];
		if (terrainBounds != undefined) {
			let left = terrainBounds[0]/128*12.8-12.3 + 0.2;
			let right = terrainBounds[1]/128*12.8-12.7 - 0.2;
			let nextChunk = terrainBounds[chunkOffCollis+1]||[left,right];
			let nextLeft = nextChunk[0]/128*12.8-12.3 + 0.2;
			let nextRight = nextChunk[1]/128*12.8-12.7 - 0.2;
			let speed = Math.sqrt(boatAcl[0]**2+boatAcl[1]**2)/5;
			if (boatPos[1] < left) {
				let dir = Math.atan2(0.1, nextLeft-left);
				boatAcl[0] += Math.cos(-dir-pi/2)*speed;
				boatAcl[1] += Math.sin(-dir-pi/2)*speed;
			} else if (boatPos[1] > right) {
				let dir = Math.atan2(0.1, nextRight-right);
				boatAcl[0] += Math.cos(-dir+pi/2)*speed;
				boatAcl[1] += Math.sin(-dir+pi/2)*speed;
			}
		}
	}
}

function placeTerrainAndRemoveLast(chunk) {
	if (objTerrains[chunk - 2] != null) {
		removeTerrain(chunk - 2);
	}
	if (objTerrains[chunk] == null) {
		if (!wwWgmTerrAvail) {
			return;
		}
		objTerrains[chunk] = 123;

		//var wwWgmTerr = generateTerrain(terrgen, chunk*256, 0, true);
		
		wwWgmTerr.postMessage([chunk*254, 0, true]);
		wwWgmTerr.onmessage = m => {
			let wgmTerr = loadWgm(m.data, shaderHouse.main3d);
			objTerrains[chunk] = addObj(wgmTerr, tfm(chunk*25.4,0,-12.5, 0,0,0, 0.5,0.5,0.5));
			objScenery[chunk] = [];
			terrainCollis[chunk] = m.data.b;

			//let chunkOffCollis = chunk * 25.4;
			//for (let collisIdx = 0; collisIdx < 256; collisIdx += 4) {
			//	let collis = m.data.b[collisIdx];
			//	let ppp1 = tfm(chunkOffCollis+collisIdx/128*12.8, 3.7, collis[0]/128*12.8-12.2);
			//	let ppp2 = tfm(chunkOffCollis+collisIdx/128*12.8, 3.7, collis[1]/128*12.8-12.8);
			//	console.log("terrgen:", collis[0]/128*12.8-12.2, boatPos[1], collis[1]/128*12.8-12.8, collisIdx);
			//	addObj(createSpriteModel(shaderHouse.main3d, data.cursor1), ppp1);
			//	addObj(createSpriteModel(shaderHouse.main3d, data.cursor2), ppp2);
			//}

			// lava
			let objLava = addObj(wgmLava, tfm(chunk*25.4,3.6,0, 0,0,0, 1,0.8,0.8));
			objLava.type = -1;
			objLava.crot = 0;
			objScenery[chunk].push(objLava);

			// ghosts
			for (let i = 0; i < 22; i++) {
				// spacing between ghosts
				if (i > 8 && i < 16)
					continue;
				
				let riverYPos = i + chunk*25.4;
				// todo: we don't need to do all positioning here yet. let's just set position to 0,0,0
				// and let update handle position
				let pos = tfm(riverYPos,3.8,(getRiverXPos(riverYPos*10)+1)/2*25-25/2, 0,pi/2,0, 0.15,0.15,0.15);
				let objGhost = addObj(createSpriteModel(shaderHouse.main3d, undefined), pos);
				objGhost.time = 0;
				objGhost.riverYPos = objGhost.tfm[12];
				objGhost.startPos = objGhost.tfm[13];
				objGhost.seed = randPrngSeed();
				objGhost.magDist = 1;

				let speed = 0.5;
				let type = 0;
				let typeSeed = (objGhost.seed * 321) % 1;
				if (typeSeed > 0.96) {
					type = 4;
					speed = 1.1;
				} else if (typeSeed > 0.94) {
					type = 3;
					speed = 0.9;
				} else if (typeSeed > 0.90) {
					type = 2;
					speed = 0.7;
				} else if (typeSeed > 0.85) {
					type = 1;
					speed = 0.6;
				}

				objGhost.type = type;
				objGhost.speed = speed;

				objGhosts.push(objGhost);
			}

			// obstacles
			for (let i = 0; i < 4; i++) {
				let riverYPos = (chunk + (i+randPrngSeed())/4) * 25.4;
				let obstType = Math.floor(randPrngSeed()*3);
				let obstRot = randPrngSeed()*2*pi;
				let obstTfm = tfm(riverYPos,3.7,(getRiverXPos(riverYPos*10)*15) + (randPrngSeed()-0.5), 0,obstRot,0, 0.5,0.5,0.5);
				let objObst = addObj(wgmObsts[obstType], obstTfm);
				objObst.type = obstType;
				objObst.crot = obstRot;
				objScenery[chunk].push(objObst);
			}

			// dock
			if ((chunk % 5) == 3) {
				let riverYPos = (chunk + 0.8) * 25.4;
				let riverDir = getRiverDir(riverYPos);
				objDock = addObj(wgmDock, tfm(riverYPos,4,(getRiverXPos(riverYPos*10)*15) + 1, 0,riverDir,0, 0.6,0.6,0.6));
				objDock.chd.push(dockManTop);
				objDock.chd.push(dockManBot);

				dockItemChoices = [1,2,3,4,5,6];
				arrRandSort(dockItemChoices);
			}

			wwWgmTerrAvail = true;
		};
		wwWgmTerrAvail = false;
	}
}

function removeTerrain(chunk) {
	removeObj(objTerrains[chunk]);
	delete objTerrains[chunk];
	delete terrainCollis[chunk];
	if (objScenery[chunk] != undefined) {
		objScenery[chunk].forEach(obj => removeObj(obj));
		delete objScenery[chunk];
	}
}

// LIGHTING

function updateLighting() {
	setLightPos(1+cam.x, 19.6, -17.6, -0.65, -2.7);
}

// 2D

function update2D() {
	ctx.font = "bold 24px sans-serif";
	ctx.textAlign = "center";

	updateHUD();
	updateScreens();
}

function updateScreens() {
	if (introTime < 400) {
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, WINW, WINH);

		let fadeIn;
		if (introTime < 200) {
			fadeIn = introTime/100;
		} else {
			fadeIn = 1-((introTime-200)/100);
		}

		ctx.fillStyle = `rgba(255,255,255,${Math.min(256,fadeIn)})`;
		ctx.fillText("CAPTURING SOULS ON THE", WINW/2, WINH/2 - 20);
		ctx.fillText("RIVER OF THE DEAD", WINW/2, WINH/2 + 20);
		introTime++;
	} else if (introTime < 900) {
		let fadeIn;
		if (introTime < 700) {
			fadeIn = (introTime-500)/100;
		} else {
			fadeIn = 1-((introTime-700)/100);
		}

		ctx.textAlign = "right";
		ctx.fillStyle = `rgba(255,255,255,${Math.min(256,fadeIn)})`;
		ctx.fillText("LEFT CLICK TO PADDLE/TAKE SOUL", WINW - 100, WINH/2 + 100);
		ctx.fillText("RIGHT CLICK TO SWITCH TOOL", WINW - 100, WINH/2 + 140);
		ctx.textAlign = "center";
		introTime++;
	}

	if (soulPower <= 0) {
		if (deathTime < 400) {
			let fadeIn;
			if (deathTime < 200) {
				fadeIn = deathTime/100;
			} else {
				fadeIn = 1-((deathTime-200)/100);
			}

			ctx.fillStyle = `rgba(255,255,255,${Math.min(256,fadeIn)})`;
			ctx.fillRect(0, 0, WINW, WINH);
	
			ctx.fillText("YOU ARE OUT OF SOUL", WINW/2, WINH/2 - 20);
			ctx.fillText("YOU WILL RESPAWN WITH NO MEMORY", WINW/2, WINH/2 + 20);
			deathTime++;
		}
		
		if (deathTime == 200) {
			deathTime = 0;
			resetGame();
		}
	}
}

function updateHUD() {
	let memoryCap = getMemoryCap();
	let bars = [
		[soul2dSprite, soulPower, 100, "#c22", 20],
		[memorySprite, memories/memoryCap, memoryCap, "#fc2", 80]
	];
	if (hasRiverMap()) {
		let chunkIdxCollis = Math.floor(boatPos[0] / 25.4) + 5 - 4;
		let chunkOffCollis = Math.floor((boatPos[0] * 10) % 254) + 50;
		let value = (chunkIdxCollis * 254 + chunkOffCollis) % (254*5);
		bars.push([riverMapSprite, value/(254*5), 100, "#ccc", 600]);
	}
	bars.forEach(i => {
		ctx.drawImage(i[0], 20, i[4]);
		ctx.fillStyle = "#222";
		ctx.fillRect(100, i[4] + 10, WINW - 100 - 30, 40);
		ctx.fillStyle = i[3];
		let barValue = (WINW - 100 - 30) * clamp(0, i[1], 1);
		ctx.fillRect(100, i[4] + 20, barValue, 20);
		ctx.globalCompositeOperation = "difference";
		ctx.fillText(Math.floor(i[1]*i[2]*100)/100, (WINW - 100 - 30)/2 + 100, i[4] + 39);
		ctx.globalCompositeOperation = "source-over";
	});
	purchasedItems.forEach((item, idx) => {
		ctx.drawImage(invItemIcons[item], idx * 64, WINH - 64);
	});
}

function updateMouse(e) {
	if (mouseJustDown[0]) {
		amx = 0;
		amy = 0;
	}
	var bounds = [
		// normal
		[-1, 1, -2, 1],
		[-1, 1, -1.5, 1.5],
		// dock active
		[-2, -0.5, 0, 1],
		[-1, 1, -1.5, 1.5]
	][mouseMode + dockActive*2];
	let oldMx = mx;
	let oldMy = my;
	mx = clamp(bounds[0], mx + e.movementX * 0.003, bounds[1]);
	my = clamp(bounds[2], my + e.movementY * 0.003, bounds[3]);
	dmx = mx - oldMx;
	dmy = my - oldMy;
	amx += e.movementX * 0.003 * 0.3;
	amy += e.movementY * 0.003 * 0.3;
}

function getRiverXPos(x) {
	const riveriscale = 5;
	return clamp(-0.7, Math.sin(x/30/riveriscale)*Math.cos(x/12/riveriscale)*Math.cos(x/29/riveriscale)*Math.cos(x/43/riveriscale), 0.7);
}

function getRiverDir(x) {
	let xPos1 = getRiverXPos(x*10)*15;
	let xPos2 = getRiverXPos(x*10+0.01)*15;
	return Math.atan2(0.01, (xPos2-xPos1)*9);
}

// upgrades

function getMemoryCap() {
	return purchasedItems.includes(INV_ITEM_BAG) ? 70 : 30;
}

function getRowSpeed() {
	return purchasedItems.includes(INV_ITEM_SPEED) ? 0.65 : 0.4;
}

function getObstacleSoulLoss() {
	return purchasedItems.includes(INV_ITEM_SHIELD) ? 5/100 : 15/100;
}

function hasMagnetPower() {
	return purchasedItems.includes(INV_ITEM_MAGNET);
}

function getSoulUsageMultiplier() {
	return purchasedItems.includes(INV_ITEM_DARKGHOST) ? 0.009 : 0.015;
}

function hasRiverMap() {
	return purchasedItems.includes(INV_ITEM_RIVERMAP);
}

// ////

// SOUND

function updateSound() {
	if (!soundInitialized && mouseJustDown[0]) {
		soundInitialized = true;
		initSound();
	}
}

function initSound() {
	zzfxV=.3    // volume
	zzfx=       // play sound
	(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let
	M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0
	,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+
	r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1)
	,-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:
	-1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/
	2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a)
	+1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);p=zzfxX.createBuffer(1,h,R);p.
	getChannelData(0).set(k);b=zzfxX.createBufferSource();b.buffer=p;b.connect(zzfxX.destination
	);b.start();return b};zzfxX=new (window.AudioContext||webkitAudioContext) // audio context
}

// ////

start();