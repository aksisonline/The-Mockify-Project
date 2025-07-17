import { uploadFile } from './file-service';
import { readFile } from 'fs/promises';
import { basename, resolve } from 'path';

// Polyfill for File in Node.js
globalThis.File = class File {
  buffer: Buffer;
  name: string;
  type: string;
  lastModified: number;
  constructor(parts: any[], name: string, options: { type?: string; lastModified?: number } = {}) {
    this.buffer = Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p)));
    this.name = name;
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }
};

async function main() {
  try {
    const filePath = resolve('public/logo-black.png');
    const buffer = await readFile(filePath);
    const file = new File([buffer], basename(filePath), { type: 'image/png' });
    const result = await uploadFile(file as any);
    // console.log('Upload successful:', result.url);
  } catch (err) {
    console.error('Upload failed:', err);
    process.exit(1);
  }
}

main(); 