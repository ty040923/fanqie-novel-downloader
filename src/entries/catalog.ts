// 获取目录入口：node scripts/catalog.mjs "<bookId 或 链接>"
import { FanqieClient } from "../client";
import { getCatalog, resolveBookId } from "../catalog";

async function main() {
    const input = process.argv[2];
    if (!input) {
        console.error("用法: node scripts/catalog.mjs \"<bookId 或 链接>\"");
        process.exit(1);
    }
    const client = new FanqieClient();
    try {
        const bookId = await resolveBookId(input);
        const meta = await getCatalog(client, bookId);
        const out = {
            book_id: meta.book_id,
            book_name: meta.book_name,
            total: meta.chapters.length,
            chapters: meta.chapters.map((c, i) => ({
                index: i + 1,
                item_id: c.item_id,
                title: c.title,
                is_locked: c.is_locked,
            })),
        };
        console.log(JSON.stringify(out, null, 2));
    } catch (e: any) {
        console.error(`[错误] ${e?.message || e}`);
        process.exit(1);
    }
}

await main();