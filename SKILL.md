---
name: fanqie-novel-downloader
description: 小说下载框架（脚手架）。当用户提到下载小说、搜书、获取章节目录、导出 TXT 时使用。提供搜索、目录、下载调度、断点续传、输出清洗的完整框架；签名与解密模块为占位，需使用者自行实现后才可下载正文。不用于商业传播或批量爬取。
---

# 小说下载框架

## 定位

本仓库是**框架/脚手架**，提供小说下载的完整工程结构与调用流程，但**不包含**任何具体平台的签名算法、密钥或解密实现。

使用者需在标注 `[未实现]` 的位置填入自己的实现，项目才能正常下载正文。目录接口为公开 API，无需签名即可使用；搜索和下载需签名实现。

## 能力

- 获取章节目录（公开 API，开箱即用）
- 搜索书籍（需签名实现）
- 下载调度框架：单线程、随机延时、断点续传、自动重试（需填入签名/解密实现后生效）
- 输出清洗：HTML 转纯文本、文件名清洗

## 环境要求

- Node.js >= 18
- 首次使用：`npm install && npm run build`

## 需要自行实现的部分

| 文件 | 需实现内容 |
|---|---|
| `src/config.ts` | 共享密钥、设备参数 |
| `src/crypto/unidbgconfig.ts` | 签名配置 |
| `src/crypto/sign.ts` | 请求签名头生成 |
| `src/crypto/argus.ts` | 签名算法 A |
| `src/crypto/ladon.ts` | 签名算法 B |
| `src/crypto/speck.ts` | 分组密码实现 |
| `src/crypto/simon.ts` | 分组密码实现 |
| `src/crypto/registerkey.ts` | 密钥注册加解密 |
| `src/crypto/content.ts` | 正文解密 |
| `src/client.ts` | 接口地址（API_BASE、PATH_*） |

每个占位文件中均有 `throw new Error("[未实现]...")`，填入实现后删除 throw 即可。

## 使用方式

### 1. 搜索书籍（需签名实现）

```bash
node scripts/search.mjs "<关键词>"
```

### 2. 获取目录（开箱即用）

```bash
node scripts/catalog.mjs "<bookId>"
```

### 3. 下载正文（需先实现签名/解密模块）

```bash
node scripts/download.mjs "<bookId>" [选项]
```

选项：
- `-o, --output <路径>`：输出 TXT
- `-c, --chapters <列表>`：指定章节，如 `1-10,15,20-30`
- `-d, --delay <ms>`：每章最小间隔（默认 1500）

JSON 结果输出到 stdout，进度输出到 stderr。

## Agent 调用流程建议

1. 用户提出下载需求 → 先用 `search.mjs` 搜索
2. 展示结果让用户确认书籍
3. 用 `catalog.mjs` 获取目录，确认章节数
4. 确认下载范围后调用 `download.mjs`
5. 若报 `[未实现]`，提示用户需先填入对应模块实现
6. 下载完成后验证输出文件，报告结果

## 目录结构

```
fanqie-novel-downloader/
├── SKILL.md
├── README.md
├── package.json
├── src/
│   ├── client.ts         # API 客户端框架（接口地址为占位）
│   ├── search.ts         # 搜索（需签名）
│   ├── catalog.ts        # 目录（公开API）
│   ├── download.ts       # 批量下载+断点续传框架
│   ├── config.ts         # 设备参数（占位）
│   ├── output.ts         # 文件名清洗
│   ├── entries/          # 脚本入口
│   ├── utils/            # 通用工具
│   └── crypto/           # ⚠️ 签名与解密（全部占位）
├── scripts/              # npm run build 生成
└── examples/
```

## 法律与合规

- 本框架仅供学习研究使用
- 下载内容仅供个人存档，请勿传播或用于商业用途
- 签名与解密算法的实现责任由使用者自行承担
- 请控制请求频率，避免对服务端造成压力