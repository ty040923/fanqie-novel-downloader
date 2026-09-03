// 文件名清洗：移除 Windows/Linux 不合法字符
export function sanitizeFilename(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
}