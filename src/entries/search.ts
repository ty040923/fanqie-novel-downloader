// 搜索书籍入口：node scripts/search.mjs "<关键词>"
import { FanqieClient } from "../client";
import { searchBooks } from "../search";

async function main() {
    const query = process.argv.slice(2).join(" ").trim();
    if (!query) {
        console.error("用法: node scripts/search.mjs \"<关键词>\"");
        process.exit(1);
    }
    const client = new FanqieClient();
    try {
        const books = await searchBooks(client, query);
        console.log(JSON.stringify(books, null, 2));
    } catch (e: any) {
        console.error(`[错误] ${e?.message || e}`);
        process.exit(1);
    }
}

await main();