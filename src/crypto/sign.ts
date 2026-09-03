// Placeholder for request signing.
//使用者需在此处实现签名头生成逻辑。

import type { UnidbgConfig } from "./unidbgconfig";

export interface UnidbgHeaders extends Record<string, string> {
    "x-argus": string;
    "x-ladon": string;
    "x-khronos": string;
}

export async function generateHeaders(
    rawQuery: string,
    xssStub = "",
    timestamp: number = Math.floor(Date.now() / 1000),
    config: UnidbgConfig = defaultUnidbgConfig,
): Promise<UnidbgHeaders> {
    throw new Error("[未实现] 请在 generateHeaders() 中填入签名逻辑。");
}

export async function signRequest(
    url: string,
    body?: ArrayBuffer | Uint8Array | string,
    config: UnidbgConfig = defaultUnidbgConfig,
): Promise<Record<string, string>> {
    throw new Error("[未实现] 请在 signRequest() 中填入签名逻辑。");
}

export { defaultUnidbgConfig, type UnidbgConfig } from "./unidbgconfig";