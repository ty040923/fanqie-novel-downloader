// 批量下载：单线程、随机延时、断点续传、自动重试
import * as fs from "node:fs";
import { FanqieClient } from "./client";
import type { ChapterInfo } from "./catalog";

export interface DownloadOptions {
    output: string;
    start?: number;
    end?: number;
    chapters?: number[];
    minDelay?: number;
}

export interface DownloadResult {
    total: number;
    ok: number;
    fail: number;
    output: string;
    failed: string[];
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function cleanText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function downloadBook(
    client: FanqieClient,
    bookName: string,
    chapters: ChapterInfo[],
    opts: DownloadOptions,
    onProgress?: (done: number, total: number) => void,
): Promise<DownloadResult> {
    const minDelay = opts.minDelay ?? 1500;
    const progressFile = opts.output + ".progress";

    let targetIndices: number[];
    if (opts.chapters && opts.chapters.length > 0) {
        targetIndices = opts.chapters.filter((i) => i >= 1 && i <= chapters.length);
    } else {
        const s = opts.start ?? 1;
        const e = opts.end ?? chapters.length;
        targetIndices = [];
        for (let i = s; i <= e; i++) targetIndices.push(i);
    }

    let doneSet = new Set<number>();
    if (fs.existsSync(progressFile)) {
        try {
            const arr = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
            if (Array.isArray(arr)) doneSet = new Set(arr);
        } catch {}
    }

    const failed: string[] = [];
    const results: Map<number, string> = new Map();
    let ok = 0;

    const total = targetIndices.length;
    let done = 0;

    for (const idx of targetIndices) {
        done++;
        if (doneSet.has(idx)) {
            onProgress?.(done, total);
            continue;
        }
        const ch = chapters[idx - 1];
        try {
            const html = await client.getChapter(ch.item_id);
            const text = cleanText(html);
            results.set(idx, `${ch.title}\n\n${text}\n\n`);
            doneSet.add(idx);
            ok++;
            fs.writeFileSync(progressFile, JSON.stringify([...doneSet]));
        } catch (e: any) {
            failed.push(`第${idx}章 ${ch.title}: ${e?.message || e}`);
        }
        onProgress?.(done, total);
        if (idx !== targetIndices[targetIndices.length - 1]) {
            const delay = minDelay + Math.random() * (minDelay * 1.5);
            await sleep(delay);
        }
    }

    const header = `《${bookName}》\n来源：番茄小说\n说明：本文件仅供个人学习与存档使用，请支持正版。\n\n`;
    const body = [...results.keys()].sort((a, b) => a - b).map((i) => results.get(i)).join("");
    fs.writeFileSync(opts.output, header + body, "utf-8");

    return {
        total,
        ok,
        fail: failed.length,
        output: opts.output,
        failed,
    };
}