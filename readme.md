# 飞书自动获客拉群系统 (Feishu AutoClip Integration)

基于飞书多维表格的智能客户获取和群聊管理系统，集成AutoClip现代化设计风格，提供AI驱动的客户管理、自动拉群、智能客服等功能。

## 项目特色

- 🤖 **AI智能客服** - 集成智能对话系统，提供自动回复和人工客服无缝切换
- 📊 **数据可视化** - 实时展示获客效果、群聊活跃度等关键指标
- 🎨 **现代化UI** - 借鉴AutoClip设计语言，提供优雅的用户体验
- 🔄 **自动化流程** - 一键创建群聊，自动邀请内外部成员
- 📱 **响应式设计** - 支持桌面端和移动端完美适配

## 项目结构

- `src/` - 主要业务逻辑和组件
  - `components/` - React组件库
  - `services/` - 飞书API集成服务
  - `utils/` - 工具函数和配置
  - `styles/` - AutoClip风格样式文件
- `feishu-bitable/record-view-plugin/` - 飞书多维表格插件
- `jianying-mcp/` - 剪映MCP集成模块

## 快速开始

### 环境要求

- Node.js 16+
- 飞书开发者账号
- 飞书多维表格权限

### 安装步骤

1. 克隆项目并安装依赖：

```bash
git clone https://github.com/Darrenpig/Feishu-mcp-AutoClip.git
cd Feishu-mcp-AutoClip
npm install
```

2. 配置飞书应用：

```bash
# 复制配置文件
cp .env.example .env

# 编辑配置文件，填入飞书应用信息
# FEISHU_APP_ID=your_app_id
# FEISHU_APP_SECRET=your_app_secret
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 安装飞书多维表格插件：
   - 进入飞书多维表格
   - 选择「插件」→「开发者模式」
   - 上传 `feishu-bitable/record-view-plugin/` 目录

## 核心功能

### 🎯 智能客户管理

- **客户信息录入** - 支持批量导入和手动添加客户信息
- **标签分类管理** - 按行业、地区、意向度等维度分类
- **跟进状态追踪** - 实时记录沟通进度和转化状态
- **AI智能分析** - 基于客户行为预测转化概率

### 🤖 自动拉群功能

- **一键创建群聊** - 根据客户类型自动创建专属群聊
- **智能成员邀请** - 自动邀请相关内部员工和外部客户
- **群聊模板配置** - 预设群聊名称、描述和欢迎语
- **批量操作支持** - 支持同时创建多个群聊

### 📊 数据分析看板

- **获客效果统计** - 展示客户来源、转化漏斗等关键指标
- **群聊活跃度分析** - 监控群聊消息量、参与度等数据
- **员工绩效报表** - 统计各员工的客户跟进情况
- **实时数据更新** - 支持数据实时刷新和导出

## 技术栈

### 前端技术

- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 原子化CSS框架
- **Ant Design** - 企业级UI组件库
- **Vite** - 快速构建工具

### 后端技术

- **Node.js** - 服务端运行环境
- **Express** - Web应用框架
- **飞书开放平台API** - 官方API集成
- **WebSocket** - 实时通信支持

### 开发配置

创建 `.env` 配置文件：

```env
# 飞书应用配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_VERIFICATION_TOKEN=your_verification_token
FEISHU_ENCRYPT_KEY=your_encrypt_key

# 服务配置
PORT=3000
NODE_ENV=development

# 数据库配置（可选）
DATABASE_URL=your_database_url
```

## 飞书应用配置

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 App ID 和 App Secret
4. 配置应用权限：
   - `im:chat` - 群聊管理
   - `im:message` - 消息发送
   - `contact:user.id:readonly` - 用户信息读取
   - `bitable:app` - 多维表格操作

### 2. 配置回调地址

在飞书应用后台配置事件回调：

```
请求地址：https://your-domain.com/api/feishu/webhook
加密方式：AES
签名校验：开启
```

### 3. 多维表格设置

1. 创建多维表格应用
2. 设计客户信息表结构：
   - 客户姓名（单行文本）
   - 联系方式（单行文本）
   - 公司名称（单行文本）
   - 行业分类（单选）
   - 跟进状态（单选）
   - 创建时间（日期）
3. 获取表格 App Token 和 Table ID

## 使用指南

### 基础使用流程

1. **启动系统**
   ```bash
   npm run dev
   ```

2. **访问管理界面**
   - 打开浏览器访问 `http://localhost:3000`
   - 使用飞书账号登录系统

3. **客户信息管理**
   - 在「客户管理」页面添加客户信息
   - 支持Excel批量导入客户数据
   - 为客户添加标签和跟进状态

4. **创建群聊**
   - 选择目标客户
   - 点击「创建群聊」按钮
   - 系统自动邀请相关人员加入

5. **数据分析**
   - 查看「数据看板」了解获客效果
   - 导出统计报表进行深度分析

## API 接口

系统提供以下RESTful API接口：

### 客户管理接口

- `GET /api/customers` - 获取客户列表
- `POST /api/customers` - 创建新客户
- `PUT /api/customers/:id` - 更新客户信息
- `DELETE /api/customers/:id` - 删除客户
- `POST /api/customers/import` - 批量导入客户数据

### 群聊管理接口

- `GET /api/chats` - 获取群聊列表
- `POST /api/chats` - 创建新群聊
- `POST /api/chats/:id/members` - 添加群成员
- `DELETE /api/chats/:id/members/:userId` - 移除群成员
- `POST /api/chats/:id/messages` - 发送群消息

### 数据分析接口

- `GET /api/analytics/overview` - 获取数据概览
- `GET /api/analytics/customers` - 客户统计数据
- `GET /api/analytics/chats` - 群聊活跃度数据
- `GET /api/analytics/performance` - 员工绩效数据
- `POST /api/analytics/export` - 导出分析报表

### 飞书集成接口

- `POST /api/feishu/webhook` - 飞书事件回调
- `GET /api/feishu/users` - 获取企业用户列表
- `POST /api/feishu/auth` - 飞书OAuth认证

## 部署指南

### 生产环境部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置生产环境变量**
   ```env
   NODE_ENV=production
   PORT=80
   FEISHU_APP_ID=your_production_app_id
   FEISHU_APP_SECRET=your_production_app_secret
   ```

3. **启动生产服务**
   ```bash
   npm start
   ```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 最佳实践

### 客户管理最佳实践

1. **数据规范化**
   - 统一客户信息格式
   - 定期清理重复数据
   - 建立标准化标签体系

2. **跟进流程标准化**
   - 制定标准跟进时间节点
   - 设置自动提醒机制
   - 记录详细沟通记录

3. **群聊管理规范**
   - 制定群聊命名规范
   - 设置群聊管理员制度
   - 定期清理无效群聊

### 性能优化建议

1. **数据库优化**
   - 为常用查询字段添加索引
   - 定期清理历史数据
   - 使用数据库连接池

2. **前端优化**
   - 实现虚拟滚动处理大量数据
   - 使用懒加载优化页面性能
   - 合理使用缓存机制

## 常见问题

### Q: 如何处理飞书API调用频率限制？
A: 系统内置了请求频率控制机制，建议：
- 使用批量接口减少API调用次数
- 实现请求队列避免并发冲突
- 合理设置缓存减少重复请求

### Q: 群聊创建失败怎么办？
A: 请检查以下几点：
- 确认飞书应用权限配置正确
- 验证目标用户是否在企业内
- 检查网络连接和API密钥

### Q: 如何备份客户数据？
A: 系统支持多种备份方式：
- 定期导出Excel文件
- 配置数据库自动备份
- 使用飞书多维表格同步功能

## 贡献指南

欢迎提交Issue和Pull Request来改进项目：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目地址：[https://github.com/Darrenpig/Feishu-mcp-AutoClip](https://github.com/Darrenpig/Feishu-mcp-AutoClip)
- 问题反馈：[Issues](https://github.com/Darrenpig/Feishu-mcp-AutoClip/issues)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
