// 目录接口：获取书籍章节目录
import { FanqieClient } from "./client";

export interface ChapterInfo {
    item_id: string;
    title: string;
    is_locked: boolean;
}

export interface BookMeta {
    book_id: string;
    book_name: string;
    chapters: ChapterInfo[];
}

/** 从输入（bookId 或链接）解析出 bookId */
export async function resolveBookId(input: string): Promise<string> {
    if (/^\d{10,}$/.test(input.trim())) return input.trim();
    const m = input.match(/reader\/(\d{10,})/);
    if (m) return m[1];
    const m2 = input.match(/page\/(\d{10,})/);
    if (m2) return m2[1];
    throw new Error(`无法解析 bookId: ${input}`);
}

export async function getCatalog(client: FanqieClient, bookId: string): Promise<BookMeta> {
    const j = await client.request(
        "https://fanqienovel.com/api/reader/directory/detail",
        { bookId, pageIndex: "0", pageCount: "20" },
    );
    if (j?.code !== undefined && j.code !== 0) {
        throw new Error(j.message || `目录获取失败(code=${j.code})`);
    }
    const data = j?.data || j;
    const allChapters: ChapterInfo[] = [];

    const volumes: any[] = Array.isArray(data?.chapterListWithVolume)
        ? data.chapterListWithVolume
        : [];
    for (const vol of volumes) {
        const chapters: any[] = Array.isArray(vol) ? vol : vol?.chapterList || [];
        for (const c of chapters) {
            allChapters.push({
                item_id: String(c.itemId ?? c.item_id ?? ""),
                title: c.title || "",
                is_locked: Boolean(c.isChapterLock ?? c.is_locked ?? false),
            });
        }
    }

    if (allChapters.length === 0 && Array.isArray(data?.allItemIds)) {
        for (const id of data.allItemIds) {
            allChapters.push({ item_id: String(id), title: "", is_locked: false });
        }
    }

    return { book_id: bookId, book_name: data?.bookName || bookId, chapters: allChapters };
}