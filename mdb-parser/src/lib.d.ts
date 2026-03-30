declare class Buffer {
  private data: Uint8Array;
  constructor(data?: Uint8Array | number[]);
  static alloc(size: number, fill?: number): Buffer;
  static allocUnsafe(size: number): Buffer;
  static from(data: Uint8Array | ArrayBuffer | number[]): Buffer;
  static concat(buffers: Buffer[], totalLength?: number): Buffer;
  static isBuffer(obj: unknown): boolean;
  readonly length: number;
  [Symbol.toStringTag]: string;
  slice(start?: number, end?: number): Buffer;
  subarray(start?: number, end?: number): Buffer;
  copy(target: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  fill(val: number, start?: number, end?: number): this;
  indexOf(search: number | string, byteOffset?: number): number;
  readUInt8(offset?: number): number;
  readUInt16LE(offset?: number): number;
  readUInt32LE(offset?: number): number;
  readUInt32BE(offset?: number): number;
  readInt32LE(offset?: number): number;
  readInt16LE(offset?: number): number;
  readUIntLE(offset: number, bytes: number): number;
  readIntLE(offset: number, bytes: number): number;
  readFloatLE(offset?: number): number;
  readDoubleLE(offset?: number): number;
  writeUInt8(val: number, offset?: number): this;
  writeUInt16LE(val: number, offset?: number): this;
  writeUInt32LE(val: number, offset?: number): this;
  writeInt32LE(val: number, offset?: number): this;
  writeIntLE(val: number, offset: number, bytes: number): this;
  writeFloatLE(val: number, offset?: number): this;
  writeDoubleLE(val: number, offset?: number): this;
  toString(encoding?: string, start?: number, end?: number): string;
  swap16(): Buffer;
  swap32(): Buffer;
  [index: number]: number;
}

declare var console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
};

declare var window: any;
