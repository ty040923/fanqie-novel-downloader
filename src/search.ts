// 搜索接口：按关键词搜索书籍
import { FanqieClient } from "./client";

export interface SearchBook {
    book_id: string;
    book_name: string;
    author: string;
    word_number: string;
    creation_status: string;
    abstract?: string;
}

function pickBook(raw: any): SearchBook | null {
    const bookId = String(raw?.book_id ?? "");
    if (!bookId || bookId === "0") return null;
    return {
        book_id: bookId,
        book_name: raw.book_name || raw.original_book_name || "",
        author: raw.author || "",
        word_number: String(raw.word_number ?? raw.total_word_number ?? ""),
        creation_status: raw.creation_status === 0 ? "连载中" : raw.creation_status === 1 ? "已完结" : String(raw.creation_status ?? ""),
        abstract: raw.abstract || "",
    };
}

export async function searchBooks(client: FanqieClient, query: string): Promise<SearchBook[]> {
    const j = await client.request(
        "/bookapi/search/tab/v",
        { query, passback: "0", selected_items: "", tab_type: "1" },
    );
    if (j?.code !== undefined && j.code !== 0) {
        throw new Error(j.message || `搜索失败(code=${j.code})`);
    }
    const tabs: any[] = Array.isArray(j?.search_tabs) ? j.search_tabs : [];
    const candidates = tabs.filter((t: any) => t?.tab_type === 1 || t?.tab_type === 3);
    const out: SearchBook[] = [];
    const seen = new Set<string>();
    for (const tab of candidates) {
        const cells: any[] = Array.isArray(tab?.data) ? tab.data : [];
        for (const cell of cells) {
            if (cell?.show_type !== 110) continue;
            const bd = Array.isArray(cell?.book_data) ? cell.book_data[0] : cell?.book_data;
            if (!bd) continue;
            const book = pickBook(bd);
            if (book && !seen.has(book.book_id)) {
                seen.add(book.book_id);
                out.push(book);
            }
        }
    }
    return out;
}