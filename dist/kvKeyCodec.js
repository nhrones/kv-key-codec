// deno-lint-ignore-file
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/types.ts
var NULL = 0;
var BYTES = 1;
var STRING = 2;
var NEGINTSTART = 11;
var INTZERO = 20;
var POSINTEND = 29;
var DOUBLE = 33;
var FALSE = 38;
var TRUE = 39;
var ESCAPE = 255;

// src/bigIntCodec.ts
var encodeBigInt = /* @__PURE__ */ __name((accumulator, item) => {
  if (typeof item === "bigint") {
    const biZero = BigInt(0);
    if (item === biZero) {
      accumulator.appendByte(INTZERO);
    } else {
      const isNeg = item < biZero;
      const rawHexBytes = (isNeg ? -item : item).toString(16);
      const rawBytes = fromHexString((rawHexBytes.length % 2 === 1 ? "0" : "") + rawHexBytes);
      const len = rawBytes.length;
      if (len > 255)
        throw Error("Tuple encoding does not support bigints larger than 255 bytes.");
      if (isNeg) {
        for (let i = 0; i < rawBytes.length; i++)
          rawBytes[i] = ~rawBytes[i];
      }
      if (len <= 8) {
        accumulator.appendByte(INTZERO + (isNeg ? -len : len));
      } else if (len < 256) {
        accumulator.appendByte(isNeg ? NEGINTSTART : POSINTEND);
        accumulator.appendByte(isNeg ? len ^ 255 : len);
      }
      accumulator.appendBuffer(rawBytes);
    }
  } else {
    throw new TypeError("Item must be BigInt");
  }
}, "encodeBigInt");
function decodeBigInt(buf, pos, code) {
  const { p } = pos;
  if (code >= NEGINTSTART && code <= POSINTEND) {
    const byteLen = code - INTZERO;
    const absByteLen = Math.abs(byteLen);
    pos.p += absByteLen;
    if (code === INTZERO) return 0;
    return decodeIt(buf, p, absByteLen, byteLen < 0);
  } else {
    throw new TypeError(`Invalid tuple data: code ${code} ('${buf}' at ${pos})`);
  }
}
__name(decodeBigInt, "decodeBigInt");
function decodeIt(buf, offset, numBytes, isNeg) {
  let num = BigInt(0);
  let shift = 0;
  for (let i = numBytes - 1; i >= 0; --i) {
    let b = buf[offset + i];
    if (isNeg) b = ~b & 255;
    num += BigInt(b) << BigInt(shift);
    shift += 8;
  }
  return isNeg ? -num : num;
}
__name(decodeIt, "decodeIt");
function fromHexString(string) {
  const buf = new Uint8Array(Math.ceil(string.length / 2));
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(string.substr(i * 2, 2), 16);
  }
  return buf;
}
__name(fromHexString, "fromHexString");
function isBigInt(x) {
  return typeof x === "bigint";
}
__name(isBigInt, "isBigInt");

// src/doubleCodec.ts
var ENCODING = true;
var DECODING = false;
function encodeDouble(accumulator, num) {
  accumulator.appendByte(DOUBLE);
  const buf = new Uint8Array(8);
  writeDoubleBE(buf, num, 0);
  accumulator.appendBuffer(adjustFloat(buf, ENCODING));
}
__name(encodeDouble, "encodeDouble");
function decodeDouble(buf) {
  adjustFloat(buf, DECODING);
  return readDoubleBE(buf, 0);
}
__name(decodeDouble, "decodeDouble");
function writeDoubleBE(buf, value, offset) {
  value = +value;
  offset = offset >>> 0;
  ieeeWrite(buf, value, offset);
}
__name(writeDoubleBE, "writeDoubleBE");
var nBytes = 8;
function ieeeWrite(buffer, value, offset) {
  let mLen = 52;
  let e;
  let m;
  let c;
  let eLen = nBytes * 8 - mLen - 1;
  const eMax = (1 << eLen) - 1;
  const eBias = eMax >> 1;
  const rt = 0;
  let i = nBytes - 1;
  const d = -1;
  const s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
  }
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
  }
  buffer[offset + i - d] |= s * 128;
}
__name(ieeeWrite, "ieeeWrite");
function ieeeRead(buffer, offset, isLE) {
  const mLen = 52;
  let e;
  let m;
  const eLen = nBytes * 8 - mLen - 1;
  const eMax = (1 << eLen) - 1;
  const eBias = eMax >> 1;
  let nBits = -7;
  let i = isLE ? nBytes - 1 : 0;
  const d = isLE ? -1 : 1;
  let s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
__name(ieeeRead, "ieeeRead");
function readDoubleBE(buf, offset) {
  offset = offset >>> 0;
  return ieeeRead(buf, offset, false);
}
__name(readDoubleBE, "readDoubleBE");
function adjustFloat(data, isEncode) {
  if (isEncode && (data[0] & 128) === 128 || !isEncode && (data[0] & 128) === 0) {
    for (let i = 0; i < data.length; i++) {
      data[i] = ~data[i];
    }
  } else {
    data[0] ^= 128;
  }
  return data;
}
__name(adjustFloat, "adjustFloat");

// https://jsr.io/@ndh/accumulator/1.0.2/mod.ts
var Accumulator = class {
  static {
    __name(this, "Accumulator");
  }
  size;
  /** resizable ArrayBuffer */
  flexBuff;
  /** the accumulation buffer */
  accumulator;
  /** head-pointer */
  head = 0;
  /** next byte (tail-pointer) */
  insertionPoint = 0;
  // accepts an initial buffer size (defaults to 32k)
  constructor(size = 32768) {
    this.size = size;
    this.flexBuff = new ArrayBuffer(size, { maxByteLength: size * 1e3 });
    this.accumulator = new Uint8Array(this.flexBuff);
  }
  /** add a single byte to our accumulator */
  appendByte(val) {
    this.requires(1);
    this.accumulator[this.insertionPoint++] = val;
  }
  /** add a buffer to our accumulator */
  appendBuffer(buf) {
    const len = buf.byteLength;
    this.requires(len);
    this.accumulator.set(buf, this.insertionPoint);
    this.insertionPoint += len;
  }
  /** requires -- checks capacity and expands the accumulator as required */
  requires(bytesRequired) {
    if (this.accumulator.length < this.insertionPoint + bytesRequired) {
      let newSize = this.accumulator.byteLength;
      while (newSize < this.insertionPoint + bytesRequired) newSize += this.size * 2;
      this.flexBuff.resize(newSize);
    }
  }
  /**
   * Consumes bytes from the head of the accumulator
   * by moving the head pointer
   * @param {number} length the number of bytes to be consumed.
   */
  consume(length) {
    this.head += length;
  }
  /** 
   * extract all appended bytes from the accumulator 
   */
  extract() {
    return this.accumulator.slice(this.head, this.insertionPoint);
  }
  /** 
   * reset both pointers to zero 
   * creating an effectively empty accumulator
   */
  reset() {
    this.head = 0;
    this.insertionPoint = 0;
  }
};

// src/encoder.ts
var encodeKey = /* @__PURE__ */ __name((accumulator, item) => {
  if (item === void 0) throw new TypeError("Packed element cannot be undefined");
  else if (item === null) accumulator.appendByte(NULL);
  else if (item === false) accumulator.appendByte(FALSE);
  else if (item === true) accumulator.appendByte(TRUE);
  else if (item.constructor === Uint8Array || typeof item === "string") {
    let itemBuf;
    if (typeof item === "string") {
      itemBuf = new TextEncoder().encode(item);
      accumulator.appendByte(STRING);
    } else {
      itemBuf = item;
      accumulator.appendByte(BYTES);
    }
    for (let i = 0; i < itemBuf.length; i++) {
      const val = itemBuf[i];
      accumulator.appendByte(val);
      if (val === 0)
        accumulator.appendByte(255);
    }
    accumulator.appendByte(0);
  } else if (Array.isArray(item)) {
    throw new Error("Nested Tuples are not supported!");
  } else if (typeof item === "number") {
    encodeDouble(accumulator, item);
  } else if (isBigInt(item)) {
    encodeBigInt(accumulator, item);
  } else {
    throw new TypeError("Packed items must be an array!");
  }
}, "encodeKey");
function packRawKey(part) {
  if (part === void 0 || Array.isArray(part) && part.length === 0) return new Uint8Array(0);
  if (!Array.isArray(part)) {
    throw new TypeError("pack must be called with an array");
  }
  const accumulator = new Accumulator();
  for (let i = 0; i < part.length; i++) {
    encodeKey(accumulator, part[i]);
  }
  return accumulator.extract();
}
__name(packRawKey, "packRawKey");
function pack(parts) {
  if (!Array.isArray(parts)) parts = [parts];
  const packedKey = packRawKey(parts);
  return packedKey;
}
__name(pack, "pack");

// src/decoder.ts
function decodeKey(buf, pos) {
  const code = buf[pos.p++];
  let { p } = pos;
  switch (code) {
    case FALSE:
      return false;
    case TRUE:
      return true;
    case BYTES: {
      const accumulator = new Accumulator();
      for (; p < buf.length; p++) {
        const byte = buf[p];
        if (byte === 0) {
          if (p + 1 >= buf.length || buf[p + 1] !== ESCAPE) {
            break;
          } else {
            p++;
          }
        }
        accumulator.appendByte(byte);
      }
      pos.p = p + 1;
      return accumulator.extract();
    }
    case STRING: {
      const accumulator = new Accumulator();
      for (; p < buf.length; p++) {
        const byte = buf[p];
        if (byte === 0) {
          if (p + 1 >= buf.length || buf[p + 1] !== ESCAPE) {
            break;
          } else {
            p++;
          }
        }
        accumulator.appendByte(byte);
      }
      pos.p = p + 1;
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(accumulator.extract().buffer);
    }
    case DOUBLE: {
      const numBuf = new Uint8Array(8);
      for (let i = 0; i < 8; i++) {
        numBuf[i] = buf[p + i];
      }
      pos.p += 8;
      return decodeDouble(numBuf);
    }
    // could be BigInt
    default: {
      if (code >= NEGINTSTART || code <= POSINTEND) {
        return decodeBigInt(buf, pos, code);
      } else {
        throw new TypeError(`Invalid KvKey data: code ${code} ('${buf}' at ${pos})`);
      }
    }
  }
}
__name(decodeKey, "decodeKey");
function unpack(buf) {
  const pos = { p: 0 };
  const key = [];
  while (pos.p < buf.byteLength) {
    key.push(decodeKey(buf, pos));
  }
  return key;
}
__name(unpack, "unpack");
export {
  pack,
  unpack
};
