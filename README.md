# fanqie-novel-downloader

小说下载**框架/脚手架**。提供搜索、目录、下载调度、断点续传的完整工程结构；签名与解密模块为占位，需使用者自行实现。

> ⚠️ 本仓库不包含任何具体平台的签名算法、密钥或解密实现。这些属于未公开的客户端协议，实现责任由使用者自行承担。
> 本项目仅供学习研究，下载内容请勿传播或用于商业用途。

## 特性

- 获取章节目录（公开 API，开箱即用）
- 搜索书籍（需签名实现）
- 下载调度框架：单线程、随机延时、断点续传、自动重试
- 输出清洗：HTML 转纯文本
- 可作为 AI Skill 被 Agent 调用，也可独立作为命令行工具

## 快速开始

### 环境要求

- Node.js >= 18

### 安装

```bash
git clone https://github.com/ty040923/fanqie-novel-downloader.git
cd fanqie-novel-downloader
npm install
npm run build
```

### 开箱即用的功能

目录接口是公开的，无需签名：

```bash
# 获取目录
node scripts/catalog.mjs <bookId>
```

搜索和下载需要先实现签名模块。

### 下载正文（需先实现签名/解密）

```bash
node scripts/download.mjs <bookId> -o output.txt
```

若未实现签名模块，会抛出 `[未实现]` 错误。请按下方说明填入实现。

## 需要自行实现的模块

以下文件为占位，包含 `throw new Error("[未实现]...")`：

| 文件 | 说明 |
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

实现方式：将每个文件中的 `throw new Error("[未实现]...")` 替换为实际逻辑。

## 整体架构

```
用户输入
  │
  ├─ search.mjs  → search.ts  → client.request (需签名)
  ├─ catalog.mjs → catalog.ts → client.request (公开API, 无需签名)
  └─ download.mjs→ download.ts→ client.getChapter
                                   ├─ refreshKeyinfo → registerkey.ts (需实现)
                                   ├─ signRequest    → sign.ts        (需实现)
                                   └─ decryptChapter → content.ts     (需实现)
```

`client.ts` 负责串联整个流程，使用者只需实现 crypto/ 下的占位模块和接口地址。

## 作为 AI Skill 使用

本项目符合 Skill 规范，包含 `SKILL.md`。将本目录放入 Skill 根目录后，Agent 可自动识别。目录功能立即可用，搜索和下载功能需 Agent 提示用户先实现签名模块。

## 目录结构

```
fanqie-novel-downloader/
├── SKILL.md
├── README.md
├── package.json
├── src/
│   ├── client.ts         # API 客户端框架
│   ├── search.ts         # 搜索
│   ├── catalog.ts        # 目录
│   ├── download.ts       # 下载调度+断点续传
│   ├── config.ts         # 设备参数（占位）
│   ├── output.ts         # 文件名清洗
│   ├── entries/          # 脚本入口
│   ├── utils/            # 通用工具
│   └── crypto/           # ⚠️ 签名与解密（全部占位）
├── scripts/              # npm run build 生成
└── examples/
```

## 注意事项

- 请控制下载频率（默认每章 1.5 秒间隔）
- 本工具不处理有声书、漫画等非文本内容
- 签名算法实现请遵守当地法律法规

## License

MIT