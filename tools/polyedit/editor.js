var ctx, can2d;
var scx, scy, cmx, cmy, md, mjd, mft;
var dpi = -1;

function setupedit() {
    can2d = document.getElementById("e");
    ctx = can2d.getContext("2d");
	
	can2d.addEventListener("mousemove", mousemove, false);
	can2d.addEventListener("mousedown", mousedown, false);
	can2d.addEventListener("mouseup", mouseup, false);
	
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#fee03a";
}
function drawbox(x, y, w, h) {
	ctx.fillStyle = "#555555";
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = "#333333";
	ctx.fillRect(x, y, w, 2);
	ctx.fillRect(x, y+h-2, w, 2);
}
function drawgrid() {
	ctx.lineWidth = 3;
	ctx.fillStyle = "#9a9a9a";
	
	for (var i = 0; i < 26; i++) {
		ctx.fillRect(280-1 + i * 16, 160-1, 2, 400+2);
	}
	for (var i = 0; i < 26; i++) {
		ctx.fillRect(280-1, 160-1 + i * 16, 400+2, 2);
	}
}
function drawbutton(x, y, w, h, text, callback, hasHold=false) {
	ctx.fillStyle = "#555555";
	ctx.fillRect(x, y, w, h);
	
	var textOff = 0;
	if (md && (x <= scx && scx < x+w) && (y <= scy && scy < y+h) &&
	          (x <= cmx && cmx < x+w) && (y <= cmy && cmy < y+h)) {
		ctx.fillStyle = "#777777";
		ctx.fillRect(x, y+h-2, w, 2);
		ctx.fillRect(x+w-2, y, 2, h);
		ctx.fillStyle = "#333333";
		ctx.fillRect(x, y, w, 2);
		ctx.fillRect(x, y, 2, h);
		textOff = 1;
		if (hasHold && mft > 30 && mft % 3 == 0) {
			callback();
		}
	} else {
		ctx.fillStyle = "#333333";
		ctx.fillRect(x, y+h-2, w, 2);
		ctx.fillRect(x+w-2, y, 2, h);
		ctx.fillStyle = "#777777";
		ctx.fillRect(x, y, w, 2);
		ctx.fillRect(x, y, 2, h);
	}
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(text, x + w/2 + textOff, y + h/2 + textOff);
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	
	if (mjd && (x <= scx && scx < x+w) && (y <= scy && scy < y+h) &&
	           (x <= cmx && cmx < x+w) && (y <= cmy && cmy < y+h)) {
		callback();
		scx = -1;
		scy = -1;
		mjd = false;
	}
}
function drawcounter(x, y, text, leftcallback, rightcallback) {
	drawbutton(x, y, 20, 30, "<", leftcallback, true);
	drawbutton(x+140, y, 20, 30, ">", rightcallback, true);
	drawbox(x+20, y, 120, 30);
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, x+80, y+15);
}
function drawscrollbar(x, y, w, h, vis, max, scroll) {
	ctx.fillStyle = "#555555";
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = "#777777";
	var scrollHeight = Math.floor((vis/max)*h);
	var incHeight = h-scrollHeight;
	if (md && (x <= scx && scx < x+w) && (y <= scy && scy < y+h)) {
		scroll = Math.floor(Math.max(0, Math.min(max-vis, ((cmy-y)/h) * (max-vis) ))); //todo
	}
	ctx.fillRect(x, y + (scroll*incHeight/(max-vis)), w, Math.floor((vis/max)*h));
	return scroll;
}

var layers = [];
var activeLayer = -1;
var activePoint = -1;
var pointCount = 0;
var pointScroll = 0;
var layerHeight = 1;
function renderedit() {
	if (md) mft++;
	
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, WINW, WINH);
	
	drawgrid();
	
	ctx.font = "16px Verdana";
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	ctx.fillText("VEDIT v1", 20, 30);
	
	if (activeLayer == -1) {
		ctx.fillText("NO ACTIVE LAYER", 200, 30);
	} else {
		var points = layers[activeLayer].points;
		var layerbytesize = 1 + Math.ceil(points.length / (6/2)); //6 bits in 2 numbers
		for (var i = 0; i < points.length; i++) {
			if (points[i].f != 0 || points[i].r != 0)
				layerbytesize += 3;
		}
		ctx.fillText("ACTIVE [[LAYER " + activeLayer + "]]  SIZE [[" + layerbytesize + "]]", 200, 30);
	}
	if (activePoint == -1) {
		ctx.fillText("NO ACTIVE POINT", 700, 30);
	} else {
		ctx.fillText("ACTIVE [[POINT " + activePoint + "]]", 700, 30);
	}
	ctx.fillRect(0, 0, 2, WINH);
	ctx.font = "14px Verdana";
	drawbutton(20, 50, 160, 30, "CREATE LAYER", () => {
		var nextId = layers.length;
		var idList = layers.map(l => l.id);
		for (var id = 0; id < idList.length; id++) {
			if (!idList.includes(id)) {
				nextId = id;
				break;
			}
		}
		layers.push({id: nextId, points: []});
	});
	drawbutton(20, 80, 160, 30, "CREATE INSTANCE", () => {
		if (activeLayer == -1)
			return;
		
		var layer = layers[activeLayer];
		layers.push({id: layer.id, points: layer.points, inst: true});
	});
	ctx.textBaseline = "middle";
	ctx.fillText("LAYERS:", 20, 125);
	
	var deletedIdx = -1;
	var fromIdx = -1;
	var toIdx = -1;
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var label = layer.inst ? "INSTOF " : "LAYER ";
		drawbutton(20, 140+i*30, 100, 30, label + layers[i].id, () => {
			activeLayer = i;
			updateLayer();
		});
		drawbutton(120, 140+i*30, 20, 30, "U", () => {fromIdx = i; toIdx = i-1});
		drawbutton(140, 140+i*30, 20, 30, "D", () => {fromIdx = i; toIdx = i+1});
		drawbutton(160, 140+i*30, 20, 30, "X", () => {deletedIdx = i; activeLayer = -1; activePoint = -1});
	}
	if (deletedIdx != -1) {
		layers.splice(deletedIdx, 1);
	}
	if (fromIdx != -1) {
		if (toIdx >= 0 && toIdx < layers.length) {
			layers.splice(toIdx, 0, layers.splice(fromIdx, 1)[0]);
		}
	}
	
	drawcounter(20, 650, "LAYHEI: " + layerHeight,
		() => {if (layerHeight > 1) layerHeight--;},
		() => {if (layerHeight < 33) layerHeight++;});
	
	drawcounter(20, 680, "POINTS: " + pointCount,
		() => {if (pointCount > 0) pointCount--; updateLayer();},
		() => {if (pointCount < 32) pointCount++; updateLayer();});
	
	if (activeLayer != -1) {
		var al = layers[activeLayer];
		
		var bwidth = 160;
		var boff = 0;
		if (pointCount > 20) {
			bwidth = 140;
			boff = pointScroll;
		}
		for (var i = 0; i < Math.min(pointCount, 20); i++) {
			var point = al.points[i+boff];
			drawbutton(780, 50+i*30, bwidth, 30, "POINT " + (i+boff), () => {activePoint = i+boff});
			if (pointCount > 20) {
				pointScroll = drawscrollbar(920, 50, 20, 600, 20, pointCount, pointScroll);
			}
		}
		
		var px = 280;
		var py = 160;
		
		var path = [];
		var pdir = 0;
		var pturn = 0;
		var pmove = 0;
		for (var i = 0; i < pointCount; i++) {
			var point = al.points[i];
			//px += point[0] * 16
			//py += point[1] * 16
			var npx = px + point[0] * 16;
			var npy = py + point[1] * 16;
			//path.push([px, py]);
			path.push([npx, npy]);
		}
		
		for (var i = 1; i < pointCount; i++) {
			ctx.beginPath();
			ctx.moveTo(path[i-1][0], path[i-1][1]);
			ctx.lineTo(path[i][0], path[i][1]);
			ctx.stroke();
		}
		
		if (pointCount > 1) {
			ctx.beginPath();
			ctx.moveTo(path[pointCount-1][0], path[pointCount-1][1]);
			ctx.lineTo(path[0][0], path[0][1]);
			ctx.stroke();
		}
			
		for (var i = 0; i < pointCount; i++) {
			if (activePoint == i || dpi == i) {
				ctx.fillStyle = "#fa3a3a";
			} else {
				ctx.fillStyle = "#ffffff";
			}
			ctx.fillRect(path[i][0]-2, path[i][1]-2, 4, 4);
		}
	}
	
    requestAnimationFrame(renderedit);
	mjd = false;
}

function startDragPoint() {
	if (activeLayer == -1) {
		return;
	}
	var points = layers[activeLayer].points;
	var pointIdx = -1;
	for (var i = 0; i < points.length; i++) {
		var point = points[i];
		if (Math.sqrt((cmx - (point[0]*16+280))**2 + (cmy - (point[1]*16+160))**2) <= 8) {
			pointIdx = i;
			break;
		}
	}
	if (pointIdx == -1) {
		return;
	}
	dpi = pointIdx;
	dragPoint();
}

function dragPoint() {
	if (activeLayer == -1) {
		return;
	}
	var points = layers[activeLayer].points;
	if (dpi == -1) {
		return;
	}
	var gridX = Math.round((cmx - 280) / 16);
	var gridY = Math.round((cmy - 160) / 16);
	points[dpi][0] = gridX;
	points[dpi][1] = gridY;
}

const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

function updateLayer() {
	if (activeLayer == -1)
		return;
	var layer = layers[activeLayer];
	activePoint = -1;
	if (layer.points.length != pointCount) {
		var points = layer.points;
		var placePos = [0,0];
		if (points.length == 0)
			placePos = [0,0];
		else if (points.length == 1)
			placePos = [points[0][0] + 15, points[0][1]];
		else if (points.length == 2)
			placePos = [points[1][0], points[1][1] + 15];
		else if (points.length >= 3)
			placePos = [Math.round((points[0][0] + points[pointCount-2][0])/2), Math.round((points[0][1] + points[pointCount-2][1])/2)];
		
		layer.points.resize(pointCount, placePos);
	}
	
	updateCode();
}

function updateCode() {
	var o = document.getElementById("o");
	
	reset();
	encodeNum(layerHeight - 1, 5, 63);
	encodeNum(pointCount, 5, 63);
}

function mousemove(e) {
	cmx = e.clientX - can2d.offsetLeft;
	cmy = e.clientY - can2d.offsetTop;
	dragPoint();
}
function mousedown(e) {
	cmx = e.clientX - can2d.offsetLeft;
	cmy = e.clientY - can2d.offsetTop;
	scx = cmx;
	scy = cmy;
	mjd = false;
	md = true;
	mft = 0;
	startDragPoint();
}
function mouseup(e) {
	mjd = true;
	md = false;
	dpi = -1;
}
function update() {}

Array.prototype.resize = function(size, def) {
	if (this.length > size) {
		while (this.length > size) {
			this.pop();
		}
	} else {
		while (this.length < size) {
			this.push({...def});
		}
	}
}

setupedit();
requestAnimationFrame(renderedit);