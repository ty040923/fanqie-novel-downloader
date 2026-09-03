// 下载书籍入口：node scripts/download.mjs "<bookId 或 链接>" [选项]
import { FanqieClient } from "../client";
import { getCatalog, resolveBookId } from "../catalog";
import { downloadBook } from "../download";
import { sanitizeFilename } from "../output";

function parseArgs(argv: string[]) {
    const args = { _: [] as string[], output: "", start: 0, end: 0, chapters: "", delay: 1500 };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case "-o": case "--output": args.output = next(); break;
            case "-s": case "--start": args.start = parseInt(next(), 10) || 0; break;
            case "-e": case "--end": args.end = parseInt(next(), 10) || 0; break;
            case "-c": case "--chapters": args.chapters = next(); break;
            case "-d": case "--delay": args.delay = parseInt(next(), 10) || 1500; break;
            default:
                if (a.startsWith("-")) { console.error(`未知参数: ${a}`); process.exit(1); }
                args._.push(a);
        }
    }
    return args;
}

function parseChapterList(s: string): number[] | null {
    if (!s) return null;
    const out: number[] = [];
    for (const part of s.split(",")) {
        const p = part.trim();
        const m = p.match(/^(\d+)-(\d+)$/);
        if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
        else if (/^\d+$/.test(p)) out.push(+p);
        else { console.error(`无法解析章节: ${p}`); process.exit(1); }
    }
    return [...new Set(out)];
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const input = args._[0];
    if (!input) {
        console.error("用法: node scripts/download.mjs \"<bookId 或 链接>\" [-o 输出] [-s 起始] [-e 结束] [-c 章节] [-d 延时]");
        process.exit(1);
    }
    const client = new FanqieClient();
    try {
        const bookId = await resolveBookId(input);
        const meta = await getCatalog(client, bookId);
        if (meta.chapters.length === 0) throw new Error("目录为空");
        const chapters = parseChapterList(args.chapters);
        const output = args.output || `${sanitizeFilename(meta.book_name || bookId)}.txt`;
        const total = chapters ? chapters.length : meta.chapters.length;
        console.error(`[下载] 《${meta.book_name || bookId}》共 ${meta.chapters.length} 章，本次下载 ${total} 章 → ${output}`);
        const t0 = Date.now();
        const res = await downloadBook(
            client, meta.book_name || bookId, meta.chapters,
            {
                output,
                start: args.start || undefined,
                end: args.end || undefined,
                chapters: chapters || undefined,
                minDelay: args.delay,
            },
            (done, tot) => {
                if (done % 10 === 0 || done === tot) {
                    console.error(`[进度] ${done}/${tot}（${((Date.now() - t0) / 1000).toFixed(0)}s）`);
                }
            },
        );
        console.log(JSON.stringify({
            book_id: meta.book_id,
            book_name: meta.book_name,
            total: res.total,
            ok: res.ok,
            fail: res.fail,
            output: res.output,
            failed: res.failed,
        }, null, 2));
    } catch (e: any) {
        console.error(`[错误] ${e?.message || e}`);
        process.exit(1);
    }
}

await main();