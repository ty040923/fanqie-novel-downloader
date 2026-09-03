// Placeholder for key registration.
//使用者需在此处实现密钥注册的加解密逻辑。

import type { DeviceConfig } from "../config";

export async function encryptKeyinfoBody(config: DeviceConfig): Promise<string> {
    throw new Error("[未实现] 请在 encryptKeyinfoBody() 中填入密钥注册请求体构造逻辑。");
}

export async function decryptKeyinfoResponse(encrypted: string): Promise<ArrayBuffer> {
    throw new Error("[未实现] 请在 decryptKeyinfoResponse() 中填入密钥解密逻辑。");
}