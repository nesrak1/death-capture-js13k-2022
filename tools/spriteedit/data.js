var encBitMask = 1;
var encChr = 0;
var encStr = "";
var hexMap = "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmno";
function encodeNum(number, inpBitlen, outBitlen) {
    var numBitMask = 1;
    for (var bitidx = 0; bitidx < inpBitlen; bitidx++) {
        if ((numBitMask & number) != 0)
            encChr |= encBitMask;
        numBitMask <<= 1;
        encBitMask <<= 1;
        if (encBitMask >= outBitlen) {
            encBitMask = 1;
            encStr += hexMap[encChr];
            encChr = 0;
        }
    }
}
function encode(inp, inpBitlen, outBitlen) {
    for (var i = 0; i < inp.length; i++) {
        encodeNum(inp[i], inpBitlen, outBitlen);
    }
    return encStr;
}
function encodeLast() {
    if (encBitMask != 1)
        encStr += hexMap[encChr];
    var retStr = encStr;
    reset();
    return retStr;
}
function reset() {
    encBitMask = 1;
    encChr = 0;
    encStr = "";
}



var dataStr, dataPos, dataMask;
//0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmno
function eggo(i) {
    i = i.charCodeAt(0);
    return (i == 0x2f) ? (0x5c - 0x30) : (i - 0x30);
}
function decode(bitlen) {
    var value = 0;
    var valueMask = 1;
    for (var i = 0; i < bitlen; i++) {
        var dataValue = eggo(dataStr[dataPos]||"0");
        value |= (((dataValue & dataMask) != 0) ? -1 : 0) & valueMask;
        valueMask <<= 1;
        dataMask <<= 1;
        if (dataMask >= 64) {
            dataMask = 1;
            dataPos++;
        }
    }
    return value;
}
function resetLoad(str) {
    dataStr = str;
    dataPos = 0;
    dataMask = 1;
}
