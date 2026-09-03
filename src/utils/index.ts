// 通用工具函数
export function concatArrayBuffers(...buffers: ArrayBuffer[]): ArrayBuffer {
    const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const b of buffers) {
        result.set(new Uint8Array(b), offset);
        offset += b.byteLength;
    }
    return result.buffer;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}