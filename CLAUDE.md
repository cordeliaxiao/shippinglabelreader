# CLAUDE.md - 项目记忆中心

> 此文件供 Claude 在每次对话重启后快速了解项目状态

## 项目概述

运单地址识别工具：上传运单标签（图片/PDF/Word/TXT），使用 Google Gemini AI 自动识别收件人地址信息，并导出为 Excel 文件。

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端 | 原生 HTML/CSS/JavaScript（单文件 SPA） |
| AI 服务 | Google Gemini API (`gemini-2.0-flash`) |
| PDF 处理 | pdf.js 3.11.174 |
| Word 处理 | mammoth.js 1.6.0 |
| Excel 导出 | xlsx.js 0.18.5 |
| 部署 | Vercel（静态托管） |
| 域名 | shippinglabelreader.vercel.app |

## 项目结构

```
shippinglabelreader/
├── index.html          # 主应用（全部逻辑，约750行）
├── ceo-dashboard.html  # TikTok 脚本生成器（独立项目，不相关）
├── vercel.json         # Vercel 部署配置
├── README.md           # 部署说明
└── CLAUDE.md           # 本文件
```

**核心代码位置**（index.html）：
- 样式：第 10-108 行
- HTML 结构：第 109-291 行
- 状态管理：第 296 行 `state` 对象
- 调试功能：第 307-338 行
- 文件处理：第 478-508 行 `fileToImages`, `fileToText`
- 文本地址提取：第 510-625 行 `extractAddressesFromText`
- 图片地址提取：第 627-746 行 `extractAddresses`

## 已完成功能

- [x] 文件上传（拖放 + 点击选择）
- [x] 支持 PDF、JPG、PNG、Word、TXT 格式
- [x] Gemini API 集成（API Key 本地存储）
- [x] 地址识别（name/address/city/state/zip/tracking/date）
- [x] 结果表格展示（可横向滚动）
- [x] Excel 导出功能
- [x] 调试日志面板（2024-12-29 新增）
- [x] 详细错误提示（区分 API 错误/解析失败/无地址）
- [x] 地址有效性验证（过滤空数据）

## 进行中的任务

- [ ] 暂无

## 重要决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2024-12-29 | 添加调试日志面板 | 用户反馈"未能识别地址"但不知道原因，需要显示 Gemini 原始响应便于排查 |
| 2024-12-29 | 添加地址验证过滤 | AI 可能返回空对象，需要过滤掉无效地址（至少要有 name 或 address） |
| 2024-12-29 | 细化错误类型 | 区分 401/403（Key无效）、429（超限）、500（服务器错误）、JSON解析失败、空结果 |

## 已知问题

| 问题 | 状态 | 解决方案 |
|------|------|---------|
| 中国大陆无法访问 Gemini API | 已知 | 需要使用 VPN |
| API 每天限制 1500 次 | 已知 | 免费额度限制，超出需等待或换 Key |
| 大文件可能超出 token 限制 | 已知 | maxOutputTokens 设为 4000（文本）/ 2000（图片） |
| TXT 文件格式不规范可能识别失败 | 已知 | 查看调试日志，检查 AI 原始响应 |

## 常用命令

```bash
# 本地预览（直接打开）
open index.html

# 使用 Vercel CLI 本地开发
vercel dev

# 部署到 Vercel
vercel --prod

# 查看 Git 状态
git status
git log --oneline -5
```

## API 配置

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **获取 API Key**: https://aistudio.google.com/apikey
- **存储位置**: localStorage (`gemini_api_key`)

---

## 对话摘要

> 每次 `/clear` 前，请让 Claude 在此记录关键进展

### 2024-12-29

**本次对话完成的工作：**
1. 分析了项目无法识别地址的原因（JSON 解析失败时静默返回空数组）
2. 添加了调试日志面板，显示 Gemini API 的原始响应
3. 改进了错误提示，区分不同类型的失败原因
4. 添加了地址有效性验证，过滤空数据
5. 创建了本 CLAUDE.md 文件

---

*最后更新: 2024-12-29*
