/*class Terrain {
    constructor(detail) {
        this.size = Math.pow(2, detail) + 1;
        this.max = this.size - 1;
        this.map = new Float32Array(this.size * this.size);
    }
    get(x, y) {
        if (x < 0 || x > this.max || y < 0 || y > this.max)
            return -1;
        return this.map[x + this.size * y];
    }
    set(x, y, val) {
        this.map[x + this.size * y] = val;
    }
    generate(roughness) {
        var self = this;

        this.set(0, 0, self.max);
        this.set(this.max, 0, self.max / 2);
        this.set(this.max, this.max, 0);
        this.set(0, this.max, self.max / 2);

        divide(this.max);

        function divide(size) {
            var x, y, half = size / 2;
            var scale = roughness * size;
            if (half < 1)
                return;

            for (y = half; y < self.max; y += size) {
                for (x = half; x < self.max; x += size) {
                    square(x, y, half, randPrngSeed() * scale * 2 - scale);
                }
            }
            for (y = 0; y <= self.max; y += half) {
                for (x = (y + half) % size; x <= self.max; x += size) {
                    diamond(x, y, half, randPrngSeed() * scale * 2 - scale);
                }
            }
            divide(size / 2);
        }

        function average(values) {
            var valid = values.filter(function (val) { return val !== -1; });
            var total = valid.reduce(function (sum, val) { return sum + val; }, 0);
            return total / valid.length;
        }

        function square(x, y, size, offset) {
            var ave = average([
                self.get(x - size, y - size),
                self.get(x + size, y - size),
                self.get(x + size, y + size),
                self.get(x - size, y + size) // lower left
            ]);
            self.set(x, y, ave + offset);
        }

        function diamond(x, y, size, offset) {
            var ave = average([
                self.get(x, y - size),
                self.get(x + size, y),
                self.get(x, y + size),
                self.get(x - size, y) // left
            ]);
            self.set(x, y, ave + offset);
        }
    }
}

function blendTerrain(t1, t2, padding) {
    let size = t1.size;
    for (let i = 0; i < padding; i++) {
        for (let j = 0; j < size; j++) {
            t2.set(i, j, t1.get(size - padding + i, j) * (padding - i)/padding + t2.get(i, j) * i/padding);
        }
    }
}

// https://stackoverflow.com/a/19878302
function diamondSquaredMap(x, y, width, height, iterations) {
    var map = fieldDiamondSquared(x, y, x+width, y+height, iterations);
 
    var maxdeviation = getMaxDeviation(iterations);
    
    for (var j = 0; j < width; j++) {
        for (var k = 0; k < height; k++) {
            map[j][k] = map[j][k] / maxdeviation;
            map[j][k] = (map[j][k] + 1) / 2;
        }
    }
    return map;

    function create2DArray(d1, d2) {
        var x = new Array(d1);

        for (var i = 0; i < d1; i += 1) {
            x[i] = new Array(d2);
        }
        return x;
    }

    function fieldDiamondSquared(x0, y0, x1, y1, iterations) {
        if (x1 < x0) { return null; }
        if (y1 < y0) { return null; }
        var finalwidth  = x1 - x0;
        var finalheight = y1 - y0;
        var finalmap = create2DArray(finalwidth, finalheight);
        if (iterations === 0) {
            for (var j = 0; j < finalwidth; j++) {
                for (var k = 0; k < finalheight; k++) {
                    finalmap[j][k] =  displace(iterations,x0+j,y0+k);
                }
            }
            return finalmap;
        }
        var ux0 = Math.floor(x0 / 2) - 1;
        var uy0 = Math.floor(y0 / 2) - 1;
        var ux1 = Math.ceil(x1 / 2) + 1;
        var uy1 = Math.ceil(y1 / 2) + 1;
        var uppermap = fieldDiamondSquared(ux0, uy0, ux1, uy1, iterations-1);

        var uw = ux1 - ux0;
        var uh = uy1 - uy0;
        
        var cx0 = ux0 * 2;
        var cy0 = uy0 * 2;

        var cw = uw*2-1;
        var ch = uh*2-1;
        var currentmap = create2DArray(cw,ch);

        for (var j = 0; j < uw; j++) {
            for (var k = 0; k < uh; k++) {
                currentmap[j*2][k*2] = uppermap[j][k];
            }
        }
        var xoff = x0 - cx0;
        var yoff = y0 - cy0;
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k - 1] + currentmap[j - 1][k + 1] + currentmap[j + 1][k - 1] + currentmap[j + 1][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 2; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 2; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }

        for (var j = 0; j < finalwidth; j++) {
            for (var k = 0; k < finalheight; k++) {
                finalmap[j][k] = currentmap[j+xoff][k+yoff];
            }
        }
        
        return finalmap;
    }

    // Random function to offset
    function displace(iterations, x, y) {
        return (((PRH(iterations,x,y) - 0.5)*2)) / (iterations+1);
    }
    
    function getMaxDeviation(iterations) {
        var dev = 0.5 / (iterations+1);
        if (iterations <= 0) return dev;
        return getMaxDeviation(iterations-1) + dev;
    }
    //This function returns the same result for given values but should be somewhat random.
    function PRH(iterations,x,y) {
        var hash;
        x &= 0xFFF;
        y &= 0xFFF;
        iterations &= 0xFF;
        hash = (iterations << 24);
        hash |= (y << 12);
        hash |= x;
        var rem = hash & 3;
        var h = hash;

        switch (rem) {
            case 3:
                hash += h;
                hash ^= hash << 32;
                hash ^= h << 36;
                hash += hash >> 22;
                break;
            case 2:
                hash += h;
                hash ^= hash << 22;
                hash += hash >> 34;
                break;
            case 1:
                hash += h;
                hash ^= hash << 20;
                hash += hash >> 2;
        }
        hash ^= hash << 6;
        hash += hash >> 10;
        hash ^= hash << 8;
        hash += hash >> 34;
        hash ^= hash << 50;
        hash += hash >> 12;
        
        return (hash & 0xFFFF) / 0xFFFF;
    }
    
};*/

function DiamondSquare() {
    this.roughness = 1;
    this.size = 256*4+1;
    this.get = get;
    this.loadedValues = {};

    rnd = 1234;

    var self = this;

    // custom stuff detcy related
    
	this.addEventListener("message", function(e) {
		self.postMessage(generateTerrain(...e.data));
	}, false);

    function generateTerrain(startx, starty, withRiver) {
        let mdlv = [];
        let mdli = [];
        let mdlc = [];
        let mdln = [];
        let mdlnc = [];
    
        //var terrgen = new DiamondSquare(256*4+1, 1);
        //terrgen.loadedValues = terrgenData;
    
        const b = 256;
    
        let terr = [];
        let lrOfCenter = [];
        let d = 0;
        for (let i = 0; i < b; i++) {
            let terr2 = [];

            for (var j = 0; j < b; j++) {
                let values = [];
    
                let isx = i + startx;
                let jsy = j + starty;
    
                for (let x = 0; x < 4; x++) {
                    for (let y = 0; y < 4; y++) {
                        let terrValue = (get(isx * 4 + x, jsy * 4 + y) / 2 + 0.5);
                        if (withRiver) {
                            //terrValue *= 1 - (0.4 + 0.4 * (i/b))*(Math.E**(-(((((Math.cos(i/20)*(-i/120)*20+j)-120)**2)/(100+i))**1.4)));
                            let xPos = (getRiverXPos(isx)*150)+b/2;
                            let xDist = Math.abs(jsy - xPos);
                            let multi = -(Math.E**(-((xDist/20)**3)))*0.6+1;
                            terrValue *= multi;
                        }
                        values.push(terrValue);
                    }
                }
                
                terr2.push(avg(values)*400);
            }

            let center = terr2.indexOf(Math.min(...terr2));
            let leftOfCenter = center - 9999;
            let rightOfCenter = center + 9999;
            
            for (let idx = 0; idx < terr2.length; idx++) {
                let terrValue = terr2[idx];
                if (terrValue > 200) {
                    if (idx > center && idx < rightOfCenter) {
                        rightOfCenter = idx;
                    } else if (idx < center && idx > leftOfCenter) {
                        leftOfCenter = idx;
                    }
                }
            }

            terr.push(terr2);
            lrOfCenter.push([leftOfCenter, rightOfCenter]);
        }
    
        for (let i = 0; i < b**2; i++) {
            let vertX = i%b;
            let vertY = Math.max(0, terr[i%b][Math.floor(i/b)]/5);
            let vertZ = Math.floor(i/b);
            mdlv.push(vertX/5, vertY/5, vertZ/5);
            mdlc.push(0x61/255,0x10/255,0x10/255,1);
            mdln.push([0,0,0]);
            mdlnc.push(0);
        }
        let faces = [];
        let idx = 0;
        for (let i = 0; i < (b-1); i++) {
            for (let j = 0; j < (b-1); j++) {
                mdli.push(idx, idx+1, idx+b+1);
                faces.push([idx, idx+1, idx+b+1]);
                mdli.push(idx, idx+b+1, idx+b);
                faces.push([idx, idx+b+1, idx+b]);
                idx++;
            }
            idx++;
        }
        for (let i = 0; i < faces.length; i++) {
            let idxA = faces[i][0]*3;
            let idxB = faces[i][1]*3;
            let idxC = faces[i][2]*3;
            let trigA = [mdlv[idxA], mdlv[idxA+1], mdlv[idxA+2]];
            let trigB = [mdlv[idxB], mdlv[idxB+1], mdlv[idxB+2]];
            let trigC = [mdlv[idxC], mdlv[idxC+1], mdlv[idxC+2]];
            let norm = getNormal(trigA, trigB, trigC);
            mdln[idxA/3] = addVec(mdln[idxA/3], norm);
            mdln[idxB/3] = addVec(mdln[idxB/3], norm);
            mdln[idxC/3] = addVec(mdln[idxC/3], norm);
            mdlnc[idxA/3]++;
            mdlnc[idxB/3]++;
            mdlnc[idxC/3]++;
        }
        
        for (let i = 0; i < mdln.length; i++) {
            mdln[i] = flipVec(normVec(mdln[i]));
        }
        
        mdln = mdln.flat(1);
        //mdln = [].concat.apply([], mdln);
        
        return {v:mdlv,i:mdli,c:mdlc,n:mdln,b:lrOfCenter};
        //return loadWgm({v:mdlv,i:mdli,c:mdlc,n:mdln}, shaderHouse.main3d);
    }
    
    function getNormal(p1, p2, p3) {	
        var vecU = subVec(p2, p1);
        var vecV = subVec(p3, p1);
        
        var normX = (vecU[1]*vecV[2]) - (vecU[2]*vecV[1]);
        var normY = (vecU[2]*vecV[0]) - (vecU[0]*vecV[2]);
        var normZ = (vecU[0]*vecV[1]) - (vecU[1]*vecV[0]);
    
        return normVec([normX, normY, normZ]);
    }

    // //////////////////////////

    /// <summary>
    /// Returns a value generated from the diamond square algorithm at given coordinates
    /// </summary>
    /// <param name='x'>The first rectangle</param>
    /// <param name='y'>The second rectangle</param>
    /// <returns>True if the given rectangles intersect</returns>
    function get(x, y) {
        // determine chunk coordinates
        var size = self.size;

        var srcX = Math.floor(x / size);
        var srcY = Math.floor(y / size);
        var values = self.loadedValues[srcX + ";" + srcY];
        if (values === undefined) {
            // the chunk at given coordinates is not loaded yet
            // create the initial array for the chunk
            var initialArray = getInitialArray(self.loadedValues, srcX, srcY);
            // create the values for the current chunk
            values = generateArray(initialArray, self.loadedValues, srcX, srcY, self.roughness);
            // save the values
            self.loadedValues[srcX + ";" + srcY] = values;
        }
        // determine the x & y coordinates within the current chunk
        var arrX = (x + (1 + Math.floor(Math.abs(x / size))) * size) % size;
        var arrY = (y + (1 + Math.floor(Math.abs(y / size))) * size) % size;
        return values[arrX][arrY];
    };

    /// <summary>
    /// Creates an initial array for a chunk
    /// </summary>
    /// <param name='loadedValues'>The chunks already loaded</param>
    /// <param name='srcX'>The x coordinate of the chunk</param>
    /// <param name='srcY'>The y coordinate of the chunk</param>
    /// <returns>An initial array for a new chunk</returns>
    function getInitialArray(loadedValues, srcX, srcY) {

        var size = self.size;

        // allocate a new array for the chunk
        var values = new Array(size);
        for (var i = 0; i < size; i++) {
            values[i] = new Array(size);
        }

        // if the left chunk is loaded, copy its right side
        if (loadedValues[(srcX - 1) + ";" + (srcY)] !== undefined) {
            var prevValues = loadedValues[(srcX - 1) + ";" + (srcY)];
            // left side
            for (var i = 0; i < size; i++)
                values[0][i] = prevValues[size - 1][i];
        }

        // if the right chunk is loaded, copy its left side
        if (loadedValues[(srcX + 1) + ";" + (srcY)] !== undefined) {
            var prevValues = loadedValues[(srcX + 1) + ";" + (srcY)];
            // right side
            for (var i = 0; i < size; i++)
                values[size - 1][i] = prevValues[0][i];
        }

        // if the top chunk is loaded, copy its bottom side
        if (loadedValues[(srcX) + ";" + (srcY - 1)] !== undefined) {
            var prevValues = loadedValues[(srcX) + ";" + (srcY - 1)];
            // top side
            for (var i = 0; i < size; i++)
                values[i][0] = prevValues[i][size - 1];
        }

        // if the bottom chunk is loaded, copy its top side
        if (loadedValues[(srcX) + ";" + (srcY + 1)] !== undefined) {
            var prevValues = loadedValues[(srcX) + ";" + (srcY + 1)];
            // bottom side
            for (var i = 0; i < size; i++)
                values[i][size - 1] = prevValues[i][0];
        }

        // diagonals

        // if the left top chunk is loaded, copy its right bottom value
        if (loadedValues[(srcX - 1) + ";" + (srcY - 1)] !== undefined) {
            var prevValues = loadedValues[(srcX - 1) + ";" + (srcY - 1)];
            values[0][0] = prevValues[size - 1][size - 1];
        }

        // if the right top chunk is loaded, copy its left bottom value
        if (loadedValues[(srcX + 1) + ";" + (srcY - 1)] !== undefined) {
            var prevValues = loadedValues[(srcX + 1) + ";" + (srcY - 1)];
            values[size - 1][0] = prevValues[0][size - 1];
        }

        // if the left bottom chunk is loaded, copy its right top value
        if (loadedValues[(srcX - 1) + ";" + (srcY + 1)] !== undefined) {
            var prevValues = loadedValues[(srcX - 1) + ";" + (srcY + 1)];
            values[0][size - 1] = prevValues[size - 1][0];
        }

        // if the right bottom chunk is loaded, copy its left top value
        if (loadedValues[(srcX + 1) + ";" + (srcY + 1)] !== undefined) {
            var prevValues = loadedValues[(srcX + 1) + ";" + (srcY + 1)];
            values[size - 1][size - 1] = prevValues[0][0];
        }

        // if any of the corners are not initialised, give them random values

        if (values[0][0] === undefined)
            values[0][0] = randPrngSeed();

        if (values[size - 1][0] === undefined)
            values[size - 1][0] = randPrngSeed();

        if (values[0][size - 1] === undefined)
            values[0][size - 1] = randPrngSeed();

        if (values[size - 1][size - 1] === undefined)
            values[size - 1][size - 1] = randPrngSeed();

        return values;
    }


    /// <summary>
    /// Applies the diamond square algorithm on the given initial array for a chunk
    /// </summary>
    /// <param name='initialArray'>The initial array for the chunk to apply the algorithm on</param>
    /// <param name='loadedValues'>The loaded chunks</param>
    /// <param name='srcX'>The x coordinate of the chunk</param>
    /// <param name='srcY'>The y coordinate of the chunk</param>
    /// <returns>The filled in array</returns>
    function generateArray(initialArray, loadedValues, srcX, srcY, roughness) {
        var appliedRoughness = roughness;

        var values = initialArray;

        // the algorithm is programmed in an iterative approach rather than a recursive one
        // the outer while loop keeps dividing its length into 2, until <= 2.
        // for each division the range of the random parameter is also halved
        // (like the fractal midpoint algorithm)
        // see http://www.gameprogrammer.com/fractal.html for more info

        var size = self.size;
        var length = size;
        while (length > 2) {
            // perform diamond step
            for (var j = 0; j < size - 1; j += length - 1) {
                for (var i = 0; i < size - 1; i += length - 1) {
                    // the square is i,j ------------ i + length -1, j
                    //               |                     |
                    //               |                     |
                    //              i + length -1 ----i + length -1, j + length - 1

                    // we need to calc point in the middle
                    var randomParam = ((2 * randPrngSeed()) - 1) * appliedRoughness;

                    // determine the center point of the square bounding box
                    var destX = Math.floor(i / 2 + (i + length - 1) / 2);
                    var destY = Math.floor(j / 2 + (j + length - 1) / 2);

                    // if the value isn't present already,
                    // set it to the average of the corner points and add the random parameter
                    if (values[destX][destY] === undefined) {
                        values[destX][destY] = average(values[i][j],
                                                       values[i + length - 1][j],
                                                       values[i][j + length - 1],
                                                       values[i + length - 1][j + length - 1])
                                               + randomParam;

                        // clip the values if they fall outside [0,1]
                        if (values[destX][destY] < 0) values[destX][destY] = 0;
                        if (values[destX][destY] > 1) values[destX][destY] = 1;

                        //console.log("DS values[" + destX + "][" + destY + "] = " + values[destX][destY]);
                    }
                }
            }

            // done the diamond step
            // perform square step
            var halfsize = Math.floor(length / 2);

            for (var j = 0; j <= size - 1; j += halfsize) //length - 1)
            {
                for (var i = (Math.floor(j / halfsize) % 2 === 0 ? halfsize : 0) ; i <= size - 1; i += length - 1) {
                    // for each square, determine midpoint of surrounding 4 diamonds
                    doDiamondOnMidpoint(values, i, j, length, appliedRoughness, loadedValues, srcX, srcY);
                }
            }

            appliedRoughness = appliedRoughness / 2; //* (1 - ((roughness * (Math.pow(2, -roughness)))));

            length = Math.floor(((length - 1) / 2) + 1);
        }

        return values;
    }

    /// <summary>
    /// Applies the diamond step of the diamond square algorithm
    /// </summary>
    /// <param name='values'>The current array to fill data in</param>
    /// <param name='midpointX'>The center x coordinate of the square</param>
    /// <param name='midpointY'>The center y coordinate of the square</param>
    /// <param name='length'>The current length of a square</param>
    /// <param name='weight'>The current roughness to apply</param>
    /// <param name='srcX'>The x coordinate of the chunk</param>
    /// <param name='srcY'>The y coordinate of the chunk</param>
    function doDiamondOnMidpoint(values, midpointX, midpointY, length, weight, loadedValues, srcX, srcY) {
        //if the target value isn't filled in yet
        if (values[midpointX][midpointY] === undefined) {

            // determine bounds of the square
            var halfLength = Math.floor(length / 2);
            var left = midpointX - halfLength;
            var right = midpointX + halfLength;
            var top = midpointY - halfLength;
            var bottom = midpointY + halfLength;

            // get the 4 required values.
            // at the edge of the chunk the values will need to be read from the adjacent chunks
            // if the adjactent chunks aren't loaded, some might be undefined. The average function
            // skips values that are undefined.
            //            pTop
            //        -----+-----
            //        |         |
            // pLeft  +    M    + pRight
            //        |         |
            //        -----+-----
            //           pBottom
            var pLeft = getValueRaw(loadedValues, left, midpointY, values, srcX, srcY);
            var pRight = getValueRaw(loadedValues, right, midpointY, values, srcX, srcY);
            var pTop = getValueRaw(loadedValues, midpointX, top, values, srcX, srcY);
            var pBottom = getValueRaw(loadedValues, midpointX, bottom, values, srcX, srcY);

            // determine random factor
            var randomParam = ((2 * randPrngSeed()) - 1) * weight;

            // determine resulting value by averaging the 4 points and adding the random factor
            var value = average(pLeft, pTop, pRight, pBottom) + randomParam;

            // clip the value if it falls outside [0,1]
            if (value < 0) value = 0;
            if (value > 1) value = 1;

            values[midpointX][midpointY] = value;
        }
    }


    /// <summary>
    /// Returns the value at the given x & y coordinates
    /// </summary>
    /// <param name='loadedValues'>The loaded chunks</param>
    /// <param name='x'>The x coordinate</param>
    /// <param name='y'>The y coordinate</param>
    /// <param name='curvalues'>The current array used for the new chunk</param>
    /// <param name='srcX'>The x coordinate of the chunk</param>
    /// <param name='srcY'>The y coordinate of the chunk</param>
    /// <returns>A value at the specified coordinates or undefined if the coordinates fall in an adjacent chunk that isn't loaded</returns>
    function getValueRaw(loadedValues, x, y, curvalues, srcX, srcY) {
        var size = self.size;
        
        // if the coordinates fall inside the chunk array, look up the value in the current array
        if (x >= 0 && y >= 0 && x < size && y < size)
            return curvalues[x][y];

        // determine the adjacent chunk coordinates
        var dstX = Math.floor((srcX * size + x) / size);
        var dstY = Math.floor((srcY * size + y) / size);

        // check if the chunk is loaded
        var values = loadedValues[dstX + ";" + dstY];
        if (values === undefined) {
            return undefined;
        }
        else {
            // determine the x & y position inside the adjacent chunk and return its value
            var arrX = x >= 0 ? x % size : (size - 1) - (Math.abs(x) % size);
            var arrY = y >= 0 ? y % size : (size - 1) - (Math.abs(y) % size);
            return values[arrX][arrY];
        }
    }

    /// <summary>
    /// Returns the average of the given points. If any of the points are undefined,
    /// they will be skipped
    /// </summary>
    /// <param name='p1'>The 1st value</param>
    /// <param name='p2'>The 2nd value</param>
    /// <param name='p3'>The 3rd value</param>
    /// <param name='p4'>The 4th value</param>
    /// <returns>An average of the given values</returns>
    function average(p1, p2, p3, p4) {
        var sum = 0;
        var count = 0;
        if (p1 !== undefined) {
            sum += p1;
            count++;
        }
        if (p2 !== undefined) {
            sum += p2;
            count++;
        }
        if (p3 !== undefined) {
            sum += p3;
            count++;
        }
        if (p4 !== undefined) {
            sum += p4;
            count++;
        }

        return sum / count;
    }

    // todo replace above
    const avg = (array) => array.reduce((a, b) => a + b) / array.length;
}