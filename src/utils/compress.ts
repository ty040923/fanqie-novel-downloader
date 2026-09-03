// gzip 压缩/解压（使用 Web API，Node 18+ 支持）
export async function gzip(data: ArrayBuffer | string): Promise<ArrayBuffer> {
    if (typeof data === "string") {
        data = new TextEncoder().encode(data).buffer;
    }
    const encoder = new CompressionStream("gzip");
    const stream = new Blob([data]).stream().pipeThrough(encoder);
    return new Response(stream).arrayBuffer();
}

export async function gunzip(data: ArrayBuffer): Promise<ArrayBuffer> {
    try {
        const decoder = new DecompressionStream("gzip");
        const stream = new Blob([data]).stream().pipeThrough(decoder);
        return await new Response(stream).arrayBuffer();
    } catch {
        return data;
    }
}