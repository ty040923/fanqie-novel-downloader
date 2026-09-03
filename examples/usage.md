# 小说下载框架使用示例

## 1. 搜索书籍（需签名实现）

```bash
node scripts/search.mjs "关键词"
```

## 2. 获取目录（开箱即用）

```bash
node scripts/catalog.mjs 7559488231163579454
```

## 3. 下载指定章节（需签名/解密实现）

```bash
node scripts/download.mjs 7559488231163579454 -c 1-10 -o output.txt
```

## 4. 下载全本

```bash
node scripts/download.mjs 7559488231163579454 -o full.txt
```

## 注意

- 下载功能需先实现 src/crypto/ 下的占位模块
- 目录功能无需签名，可直接使用
- 请控制下载频率，避免对服务端造成压力