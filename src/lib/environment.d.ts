declare module "browserify-aes/browser.js" {
  const browserifyAES: {
    createDecipheriv: (cipher: string, key: Buffer, iv: Buffer) => any;
  };
  export default browserifyAES;
}

declare module "create-hash" {
  import { Hash } from "crypto";
  export default function createHash(algorithm: string): Hash;
}
