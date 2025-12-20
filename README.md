# 🚚 运单地址识别工具 | Shipping Label Extractor

**Powered by Midas Touch Partners**

上传运单标签（PDF/图片），自动识别收件人地址并导出 Excel。

---

## 📦 部署到 Vercel（推荐）

### 步骤 1：上传代码到 GitHub

1. 登录 GitHub，创建新仓库：`shipping-label-tool`
2. 把这个文件夹里的所有文件上传到仓库

文件结构应该是：
```
shipping-label-tool/
├── index.html        # 前端页面
├── api/
│   └── extract.js    # 后端 API（保护 Key）
├── vercel.json       # Vercel 配置
└── README.md         # 说明文档
```

### 步骤 2：部署到 Vercel

1. 打开 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 **"Add New Project"**
4. 选择你刚创建的 `shipping-label-tool` 仓库
5. 点击 **"Deploy"**

### 步骤 3：配置环境变量（重要！）

1. 部署完成后，进入项目 **Settings**
2. 点击左侧 **"Environment Variables"**
3. 添加以下变量：

   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | `AIzaSyAUI2ndzXGloRe5djGovyxtcHR43UUj9YY` |

4. 点击 **"Save"**
5. 回到 **Deployments**，点击 **"Redeploy"** 重新部署

### 步骤 4：访问你的工具

部署成功后，Vercel 会给你一个地址，类似：
```
https://shipping-label-tool.vercel.app
```

打开这个地址就可以使用了！

---

## 🔒 安全说明

- ✅ API Key 存储在 Vercel 环境变量中，用户看不到
- ✅ 前端代码不包含任何敏感信息
- ✅ 只有通过你的域名才能调用 API

---

## ⚠️ 注意事项

1. **中国大陆用户**：需要科学上网才能访问 Google Gemini API
2. **免费额度**：Gemini 每天约 1500 次请求，超过会报错
3. **更换 Key**：如果需要更换 API Key，在 Vercel Settings 里修改环境变量即可

---

## 📞 技术支持

如有问题，请联系 Midas Touch Partners 技术团队。
