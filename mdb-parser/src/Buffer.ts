export class Buffer {
  private data: Uint8Array;

  constructor(data: Uint8Array | number[] = []) {
    if (data instanceof Uint8Array) {
      this.data = data;
    } else {
      this.data = new Uint8Array(data);
    }
  }

  static alloc(size: number, fill = 0): Buffer {
    const arr = new Uint8Array(size);
    if (fill) {
      arr.fill(fill);
    }
    return new Buffer(arr);
  }

  static allocUnsafe(size: number): Buffer {
    return new Buffer(new Uint8Array(size));
  }

  static from(data: Uint8Array | ArrayBuffer | number[]): Buffer {
    if (data instanceof ArrayBuffer) {
      return new Buffer(new Uint8Array(data));
    }
    if (data instanceof Uint8Array) {
      return new Buffer(new Uint8Array(data));
    }
    return new Buffer(new Uint8Array(data));
  }

  static concat(buffers: Buffer[], totalLength?: number): Buffer {
    if (!totalLength) {
      totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      result.set(buf.data, offset);
      offset += buf.length;
    }
    return new Buffer(result);
  }

  static isBuffer(obj: unknown): boolean {
    return obj instanceof Buffer;
  }

  get length(): number {
    return this.data.length;
  }

  get [Symbol.toStringTag](): string {
    return "Buffer";
  }

  slice(start?: number, end?: number): Buffer {
    return new Buffer(this.data.slice(start, end));
  }

  subarray(start?: number, end?: number): Buffer {
    return new Buffer(this.data.subarray(start, end));
  }

  copy(
    target: Buffer,
    targetStart = 0,
    sourceStart = 0,
    sourceEnd?: number,
  ): number {
    const src = sourceEnd !== undefined
      ? this.data.slice(sourceStart, sourceEnd)
      : this.data.subarray(sourceStart);
    target.data.set(src, targetStart);
    return src.length;
  }

  fill(val: number, start = 0, end?: number): this {
    this.data.fill(val, start, end);
    return this;
  }

  indexOf(search: number | string, byteOffset = 0): number {
    if (typeof search === "number") {
      for (let i = byteOffset; i < this.data.length; i++) {
        if (this.data[i] === search) return i;
      }
      return -1;
    }
    if (typeof search === "string") {
      const searchBytes: number[] = [];
      for (let i = 0; i < search.length; i++) {
        searchBytes.push(search.charCodeAt(i));
      }
      outer: for (let i = byteOffset; i <= this.data.length - searchBytes.length; i++) {
        for (let j = 0; j < searchBytes.length; j++) {
          if (this.data[i + j] !== searchBytes[j]) continue outer;
        }
        return i;
      }
      return -1;
    }
    return -1;
  }

  readUInt8(offset = 0): number {
    return this.data[offset] || 0;
  }

  readUInt16LE(offset = 0): number {
    return (this.data[offset] || 0) | ((this.data[offset + 1] || 0) << 8);
  }

  readUInt32LE(offset = 0): number {
    return (this.data[offset] || 0)
      | ((this.data[offset + 1] || 0) << 8)
      | ((this.data[offset + 2] || 0) << 16)
      | ((this.data[offset + 3] || 0) << 24);
  }

  readUInt32BE(offset = 0): number {
    return ((this.data[offset] || 0) << 24)
      | ((this.data[offset + 1] || 0) << 16)
      | ((this.data[offset + 2] || 0) << 8)
      | (this.data[offset + 3] || 0);
  }

  readInt32LE(offset = 0): number {
    const val = this.readUInt32LE(offset);
    return val >= 0x80000000 ? val - 0x100000000 : val;
  }

  readInt16LE(offset = 0): number {
    const val = this.readUInt16LE(offset);
    return val >= 0x8000 ? val - 0x10000 : val;
  }

  readUIntLE(offset: number, bytes: number): number {
    let result = 0;
    for (let i = 0; i < bytes; i++) {
      result |= (this.data[offset + i] || 0) << (i * 8);
    }
    return result;
  }

  readIntLE(offset: number, bytes: number): number {
    let result = this.readUIntLE(offset, bytes);
    const signBit = 1 << (bytes * 8 - 1);
    if (result >= signBit) {
      result -= signBit * 2;
    }
    return result;
  }

  readFloatLE(offset = 0): number {
    const view = new DataView(this.data.buffer, this.data.byteOffset + offset, 4);
    return view.getFloat32(0, true);
  }

  readDoubleLE(offset = 0): number {
    const view = new DataView(this.data.buffer, this.data.byteOffset + offset, 8);
    return view.getFloat64(0, true);
  }

  writeUInt8(val: number, offset = 0): this {
    this.data[offset] = val & 0xff;
    return this;
  }

  writeUInt16LE(val: number, offset = 0): this {
    this.data[offset] = val & 0xff;
    this.data[offset + 1] = (val >> 8) & 0xff;
    return this;
  }

  writeUInt32LE(val: number, offset = 0): this {
    this.data[offset] = val & 0xff;
    this.data[offset + 1] = (val >> 8) & 0xff;
    this.data[offset + 2] = (val >> 16) & 0xff;
    this.data[offset + 3] = (val >> 24) & 0xff;
    return this;
  }

  writeInt32LE(val: number, offset = 0): this {
    return this.writeUInt32LE(val, offset);
  }

  writeIntLE(val: number, offset: number, bytes: number): this {
    for (let i = 0; i < bytes; i++) {
      this.data[offset + i] = (val >> (i * 8)) & 0xff;
    }
    return this;
  }

  writeFloatLE(val: number, offset = 0): this {
    const view = new DataView(this.data.buffer, this.data.byteOffset + offset, 4);
    view.setFloat32(0, val, true);
    return this;
  }

  writeDoubleLE(val: number, offset = 0): this {
    const view = new DataView(this.data.buffer, this.data.byteOffset + offset, 8);
    view.setFloat64(0, val, true);
    return this;
  }

  toString(
    encoding: string = "utf8",
    start?: number,
    end?: number,
  ): string {
    const slice = this.data.slice(start, end);
    if (encoding === "hex") {
      return Array.from(slice)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    if (encoding === "ascii") {
      return String.fromCharCode.apply(null, Array.from(slice));
    }
    if (encoding === "utf16le") {
      let result = "";
      for (let i = 0; i < slice.length - 1; i += 2) {
        const code = slice[i] | (slice[i + 1] << 8);
        result += String.fromCharCode(code);
      }
      return result;
    }
    if (encoding === "ucs-2") {
      return this.toString("utf16le", start, end);
    }
    return String.fromCharCode.apply(null, Array.from(slice));
  }

  swap16(): Buffer {
    const result = new Uint8Array(this.data.length);
    for (let i = 0; i < this.data.length; i += 2) {
      result[i] = this.data[i + 1];
      result[i + 1] = this.data[i];
    }
    return new Buffer(result);
  }

  swap32(): Buffer {
    const result = new Uint8Array(this.data.length);
    for (let i = 0; i < this.data.length; i += 4) {
      result[i] = this.data[i + 3];
      result[i + 1] = this.data[i + 2];
      result[i + 2] = this.data[i + 1];
      result[i + 3] = this.data[i];
    }
    return new Buffer(result);
  }

  [index: number]: number;
}

Object.defineProperty(Buffer.prototype, Symbol.toStringTag, {
  value: "Buffer",
  configurable: true,
});
