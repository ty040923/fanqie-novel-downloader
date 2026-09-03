// 通用 API 客户端框架：签名 + 请求 + 密钥管理 + 内容解密
import { defaultConfig, type DeviceConfig } from "./config";
import { signRequest } from "./crypto/sign";
import { encryptKeyinfoBody, decryptKeyinfoResponse } from "./crypto/registerkey";
import { decryptChapter } from "./crypto/content";

// ⚠️ 以下为占位地址，使用者需替换为实际接口地址
const API_BASE = "https://your-api-host.example.com";
const UA = "your-user-agent-here";

// 接口路径占位
const PATH_REGISTER_KEY = "/api/v1/register";
const PATH_CHAPTER = "/api/v1/chapter";

export class FanqieClient {
    private cfg: DeviceConfig;
    private keyInfo: { key?: ArrayBuffer; keyver?: number } | null = null;

    constructor(cfg?: DeviceConfig) {
        this.cfg = { ...defaultConfig, ...(cfg || {}) };
    }

    private baseParams(extra: Record<string, string> = {}): Record<string, string> {
        const c = this.cfg;
        return {
            iid: c.install_id,
            device_id: c.device_id,
            // 以下为通用设备参数字段，具体值由使用者填入
            ...extra,
        };
    }

    async request(
        path: string,
        query: Record<string, string> = {},
        method: "GET" | "POST" = "GET",
        body?: string,
    ): Promise<any> {
        const url = path.startsWith("http")
            ? `${path}?${new URLSearchParams(query).toString()}`
            : `${API_BASE}${path}?${new URLSearchParams(this.baseParams(query)).toString()}`;
        const signed = path.startsWith("http")
            ? {}
            : await signRequest(url, body);
        const headers: Record<string, string> = {
            ...signed,
            "User-Agent": path.startsWith("http")
                ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                : UA,
        };
        const opts: RequestInit = { method, headers };
        if (body) {
            headers["Content-Type"] = "application/json; charset=utf-8";
            opts.body = body;
        }
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
        const txt = await res.text();
        if (!txt) throw new Error(`empty body for ${path}`);
        return JSON.parse(txt);
    }

    async refreshKeyinfo(): Promise<{ key?: ArrayBuffer; keyver?: number }> {
        const body = await encryptKeyinfoBody(this.cfg);
        const j = await this.request(PATH_REGISTER_KEY, {}, "POST", body);
        const ek = j?.data?.key;
        if (!ek) throw new Error(`key registration failed: ${JSON.stringify(j).slice(0, 160)}`);
        const key = await decryptKeyinfoResponse(ek);
        this.keyInfo = { key, keyver: j?.data?.keyver };
        return this.keyInfo;
    }

    async getChapter(itemId: string, retry = 0): Promise<string> {
        if (retry > 4) throw new Error(`getChapter retry exhausted: ${itemId}`);
        if (!this.keyInfo) {
            await this.refreshKeyinfo();
        }
        const j = await this.request(PATH_CHAPTER, { item_id: itemId, req_type: "1" });
        const d = j?.data;
        if (!d) throw new Error(`no data for ${itemId}: ${JSON.stringify(j).slice(0, 160)}`);
        if (d.content === "Invalid") {
            this.keyInfo = null;
            return this.getChapter(itemId, retry + 1);
        }
        const cfg: DeviceConfig = { ...this.cfg, key_info: this.keyInfo || {} };
        const plain = await decryptChapter(d.content, d, cfg);
        if (typeof plain !== "string") throw new Error(`unexpected plain type for ${itemId}`);
        return plain;
    }
}