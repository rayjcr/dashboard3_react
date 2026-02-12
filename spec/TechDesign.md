# Dashboard3 技术设计文档

> **版本**: 1.0  
> **创建日期**: 2026-02-05  
> **作者**: Dashboard Team  
> **状态**: 实施中

---

## 1. 概述

### 1.1 项目背景

Dashboard3 是 Citcon 商户管理后台的前端重构项目。原系统基于 **Angular 5.2** 开发，历经多年迭代，面临以下挑战：

- **技术债务累积**：Angular 5.2 已于 2018 年停止官方支持，存在安全漏洞风险
- **依赖库过时**：大量第三方库无法升级，与现代工具链不兼容
- **开发效率低下**：构建速度慢，开发体验差
- **维护成本高**：代码结构老旧，新功能开发和 Bug 修复困难
- **招聘困难**：Angular 5.x 开发者稀缺

### 1.2 项目范围

本次重构覆盖商户管理后台的全部前端功能模块：

| 模块                        | 描述                                 |
| --------------------------- | ------------------------------------ |
| **用户认证**                | 登录、登出、会话管理、MFA 双因素认证 |
| **Dashboard**               | 交易汇总、日报、月报、结算状态       |
| **Transaction Lookup**      | 交易查询、退款、捕获、取消           |
| **Dispute Management**      | 争议列表、争议详情、文件上传         |
| **Alipay Direct**           | 支付宝直连结算                       |
| **Multi Fundings**          | 多渠道资金结算                       |
| **Reserve Summary**         | 储备金汇总                           |
| **Smart Gateway**           | 智能网关管理                         |
| **All Transactions Search** | 全局交易搜索                         |
| **Account Settings**        | 账户设置、密码修改、手机号变更       |

---

## 2. 目标

### 2.1 业务目标

| 目标             | 描述                     | 度量方式                       |
| ---------------- | ------------------------ | ------------------------------ |
| **提升用户体验** | 现代化 UI/UX，响应更快   | 加载时间和用户体验优于旧版本   |
| **降低维护成本** | 标准化代码结构，完善文档 | 代码可读性提升，调试工具更完善 |
| **增强安全性**   | 消除已知安全漏洞         | `npm audit` 无高危漏洞         |
| **支持移动端**   | 响应式设计，移动端可用   | 支持主流移动设备               |

> **说明**: 以上度量方式用于项目完成后的效果验证，而非预设的量化指标。

### 2.2 技术目标

| 目标               | 描述                                         |
| ------------------ | -------------------------------------------- |
| **现代化技术栈**   | 采用 React 19 + TypeScript + Vite 主流技术栈 |
| **类型安全**       | 100% TypeScript 覆盖，消除 `any` 类型        |
| **组件化架构**     | 高内聚低耦合的组件设计                       |
| **状态管理规范化** | 统一使用 Zustand 管理全局状态                |
| **API 层抽象**     | 统一的 API 调用层，支持拦截器和错误处理      |
| **测试覆盖**       | 核心业务逻辑单元测试覆盖率 > 80%             |
| **构建优化**       | 生产包体积 < 500KB (gzipped)，首屏加载 < 2s  |

### 2.3 非目标 (Out of Scope)

- 后端 API 重构
- 数据库架构变更
- 业务逻辑变更（保持功能对等）

---

## 3. 技术选型

### 3.1 技术栈对比

| 维度         | 旧系统 (Angular 5.2) | 新系统 (React 19)            |
| ------------ | -------------------- | ---------------------------- |
| **框架**     | Angular 5.2 (2017)   | React 19 (2024)              |
| **语言**     | TypeScript 2.x       | TypeScript 5.6               |
| **构建工具** | Webpack 3            | Vite 6                       |
| **状态管理** | RxJS + Services      | Zustand 4                    |
| **数据请求** | HttpClient           | Axios + TanStack Query       |
| **UI 框架**  | Angular Material     | Ant Design 6                 |
| **CSS 方案** | SCSS                 | Tailwind CSS + CSS Variables |
| **路由**     | Angular Router       | React Router 6               |
| **测试**     | Karma + Jasmine      | Vitest + Testing Library     |

### 3.2 选型理由

#### React 19

- **生态系统成熟**：最大的前端生态，丰富的第三方库支持
- **开发者资源丰富**：招聘容易，社区活跃
- **React 19 新特性**：Server Components、自动批处理、并发渲染

#### Vite

- **极速开发体验**：冷启动 < 1s，HMR 即时生效
- **优化的生产构建**：基于 Rollup，Tree Shaking 优秀
- **原生 ESM 支持**：更快的模块解析

#### Zustand

- **轻量级**：< 2KB，无 boilerplate
- **TypeScript 友好**：完整的类型推断
- **中间件系统**：支持持久化、开发工具
- **对比 Redux**：减少 80% 样板代码

#### TanStack Query

- **服务端状态管理**：自动缓存、后台刷新
- **减少请求**：智能去重、失效重试
- **开发体验**：DevTools 可视化

#### Ant Design 6

- **企业级组件库**：覆盖 Dashboard 所需全部组件
- **国际化支持**：内置多语言
- **主题定制**：CSS Variables + Design Token

---

## 4. 系统架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│                      React Application                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │   Pages     │  Components │   Hooks     │     Utils       │  │
│  │             │             │             │                 │  │
│  │ LoginPage   │ Layout      │ useIdle     │ currency        │  │
│  │ Dashboard   │ TreeMenu    │ useBreak    │ download        │  │
│  │ ...         │ Tables      │ point       │ ...             │  │
│  └──────┬──────┴──────┬──────┴──────┬──────┴─────────────────┘  │
│         │             │             │                            │
│  ┌──────▼─────────────▼─────────────▼────────────────────────┐  │
│  │                    State Management                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │  │
│  │  │ authStore│ │ uiStore  │ │dashboard │ │ TanStack     │  │  │
│  │  │ (Zustand)│ │ (Zustand)│ │ Store    │ │ Query Cache  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                      API Layer                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Axios Instance (apiClient)              │  │  │
│  │  │  - Base URL Configuration                            │  │  │
│  │  │  - Request/Response Interceptors                     │  │  │
│  │  │  - Error Handling                                    │  │  │
│  │  │  - Authentication Header Injection                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌───────────┐┌───────────┐┌───────────┐┌───────────────┐ │  │
│  │  │ authApi   ││ summaryApi││disputeApi ││ transactionApi│ │  │
│  │  └───────────┘└───────────┘└───────────┘└───────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend API       │
                    │   (Unchanged)       │
                    └─────────────────────┘
```

### 4.2 目录结构

```
src/
├── assets/              # 静态资源
│   ├── fonts/           # 字体文件
│   ├── icons/           # 图标
│   └── images/          # 图片
├── components/          # 可复用组件
│   ├── auth/            # 认证相关组件
│   ├── common/          # 通用组件
│   ├── dashboard/       # Dashboard 业务组件
│   ├── layout/          # 布局组件
│   └── features/        # 特性组件
├── config/              # 配置文件
│   ├── env.ts           # 环境配置
│   └── userMenu.ts      # 菜单配置
├── hooks/               # 自定义 Hooks
├── pages/               # 页面组件
├── router/              # 路由配置
├── services/            # 服务层
│   └── api/             # API 接口
├── stores/              # Zustand Stores
├── styles/              # 全局样式
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
```

### 4.3 状态管理架构

```
┌────────────────────────────────────────────────────────────┐
│                    State Management                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Client State (Zustand)                  │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │  authStore   │  │   uiStore    │  │themeStore │  │   │
│  │  │              │  │              │  │           │  │   │
│  │  │ - user       │  │ - sidebar    │  │ - theme   │  │   │
│  │  │ - token      │  │ - selected   │  │           │  │   │
│  │  │ - hierarchy  │  │   Node       │  │           │  │   │
│  │  │ - permissions│  │ - drawer     │  │           │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │                                                      │   │
│  │  Persistence: localStorage (zustand/middleware)      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Server State (TanStack Query)             │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Dashboard    │  │ Transaction  │  │  Dispute  │  │   │
│  │  │ Queries      │  │ Queries      │  │  Queries  │  │   │
│  │  │              │  │              │  │           │  │   │
│  │  │ - summary    │  │ - list       │  │ - list    │  │   │
│  │  │ - monthly    │  │ - detail     │  │ - detail  │  │   │
│  │  │ - daily      │  │ - refund     │  │ - upload  │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │                                                      │   │
│  │  Cache: In-memory (configurable stale time)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 5. 核心设计

### 5.1 认证设计

#### 认证流程

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  Login  │──────│ Submit  │──────│  Store  │──────│ Navigate│
│  Page   │      │ API     │      │ Token   │      │ Dashboard│
└─────────┘      └─────────┘      └─────────┘      └─────────┘
                      │                │
                      ▼                ▼
                ┌─────────┐      ┌─────────────┐
                │ Error   │      │ Persist to  │
                │ Message │      │ localStorage│
                └─────────┘      └─────────────┘
```

#### 安全特性

| 特性           | 实现方式                                    |
| -------------- | ------------------------------------------- |
| **空闲超时**   | `useIdleTimeout` Hook，20分钟无操作自动登出 |
| **Token 存储** | localStorage + Zustand persist middleware   |
| **路由守卫**   | `RequireAuth` / `PublicOnly` 组件包装       |
| **多标签同步** | `storage` 事件监听，跨标签页状态同步        |
| **MFA 支持**   | 双因素认证，手机验证码                      |

### 5.2 路由设计

```typescript
// 路由结构
/                          # 重定向到 /dashboard
/login                     # 登录页 (PublicOnly)
/dashboard                 # Dashboard (RequireAuth)
/daily-detail/:date        # 日报详情
/alltransactions           # 全局交易搜索
/accountsettings           # 账户设置
/auth-callback             # OAuth 回调
/*                         # 404 页面
```

### 5.3 组件设计原则

| 原则             | 描述                                                         |
| ---------------- | ------------------------------------------------------------ |
| **单一职责**     | 每个组件只做一件事                                           |
| **Props 向下**   | 数据通过 Props 传递，避免 prop drilling 时使用 Context/Store |
| **状态提升**     | 共享状态提升到最近公共祖先或 Store                           |
| **组合优于继承** | 使用 children 和 render props                                |
| **受控组件**     | 表单使用 Ant Design Form 统一管理                            |

### 5.4 API 设计

#### 请求拦截器

```typescript
// 自动注入认证信息
apiClient.interceptors.request.use((config) => {
  const token = getAuthStore().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 响应拦截器

```typescript
// 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      getAuthStore().logout();
    }
    return Promise.reject(error);
  },
);
```

---

## 6. 迁移策略

### 6.1 迁移方式

采用 **完全重写** 策略而非渐进式迁移：

| 考虑因素         | 决策                         |
| ---------------- | ---------------------------- |
| **框架差异大**   | Angular → React 无法渐进迁移 |
| **技术债务多**   | 重写可以彻底清理             |
| **业务相对独立** | 商户后台可独立部署           |

### 6.2 功能对等验证

| 验证方式     | 描述                       |
| ------------ | -------------------------- |
| **截图对比** | 新旧系统 UI 截图对比       |
| **API 契约** | 确保调用相同 API，参数一致 |
| **E2E 测试** | 关键流程自动化测试         |
| **UAT 测试** | 用户验收测试               |

### 6.3 上线计划

```
Phase 1: 开发 & 内部测试
  └── 完成核心功能开发
  └── 单元测试覆盖
  └── 内部 QA 测试

Phase 2: Beta 测试
  └── 部分用户灰度
  └── 收集反馈
  └── Bug 修复

Phase 3: 正式上线
  └── 全量切换
  └── 旧系统下线
  └── 监控告警
```

---

## 7. 性能优化

### 7.1 构建优化

| 优化项           | 方式                      |
| ---------------- | ------------------------- |
| **代码分割**     | 路由级别 lazy loading     |
| **Tree Shaking** | 仅打包使用的代码          |
| **压缩**         | Terser + Gzip/Brotli      |
| **依赖外置**     | 大型依赖 CDN 加载（可选） |

### 7.2 运行时优化

| 优化项       | 方式                                     |
| ------------ | ---------------------------------------- |
| **请求缓存** | TanStack Query 自动缓存                  |
| **防抖节流** | 搜索输入防抖                             |
| **Memo 化**  | `React.memo` / `useMemo` / `useCallback` |

---

## 8. 测试策略

### 8.1 测试分类

```
        ┌───────────┐
        │   E2E     │  少量关键流程
        │   Tests   │
        ├───────────┤
        │Integration│  组件集成测试
        │   Tests   │
        ├───────────┤
        │   Unit    │  大量单元测试
        │   Tests   │  Utils/Hooks/Stores
        └───────────┘
```

### 8.2 测试工具

| 层级     | 工具              |
| -------- | ----------------- |
| 单元测试 | Vitest            |
| 组件测试 | Testing Library   |
| E2E 测试 | Playwright (可选) |

---

## 9. 安全性设计

### 9.1 安全架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        安全防护层                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   传输层安全      │  │    认证与授权     │  │   数据安全    │  │
│  │                  │  │                  │  │               │  │
│  │  • HTTPS Only    │  │  • JWT Token     │  │  • 敏感数据   │  │
│  │  • TLS 1.2+      │  │  • 空闲超时      │  │    脱敏       │  │
│  │  • HSTS Header   │  │  • 路由守卫      │  │  • 安全存储   │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   XSS 防护       │  │    CSRF 防护     │  │   输入验证    │  │
│  │                  │  │                  │  │               │  │
│  │  • React 自动    │  │  • Token 验证    │  │  • 类型检查   │  │
│  │    转义          │  │  • SameSite      │  │  • 格式校验   │  │
│  │  • CSP 策略      │  │    Cookie        │  │  • 长度限制   │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 认证与会话安全

#### 9.2.1 JWT Token 管理

| 安全措施       | 实现方式                                  | 文件位置                    |
| -------------- | ----------------------------------------- | --------------------------- |
| Token 存储     | localStorage + Zustand persist            | `stores/authStore.ts`       |
| 请求认证       | Axios 请求拦截器添加 Authorization Header | `services/api/apiClient.ts` |
| Token 过期处理 | 401 响应自动触发登出                      | `services/api/apiClient.ts` |
| 登出清理       | 清除内存状态 + localStorage               | `stores/authStore.ts`       |

```typescript
// 请求拦截器：自动添加认证 Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理认证失败
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 失效或被篡改，强制登出
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
```

> **说明**:
>
> - 请求拦截器负责将 Token 附加到每个 API 请求的 Authorization Header
> - 响应拦截器负责检测 401 状态码（Token 无效/过期），自动触发登出
> - Token 的真正验证由后端完成，前端负责正确传递和失效处理

#### 9.2.2 会话超时保护

| 安全措施 | 配置                                          | 说明               |
| -------- | --------------------------------------------- | ------------------ |
| 空闲超时 | 20 分钟                                       | 无用户活动自动登出 |
| 监听事件 | mousemove, keydown, click, scroll, touchstart | 全面覆盖用户交互   |
| 超时处理 | 清除状态 + 重定向登录页                       | 彻底清理会话       |

```typescript
// useIdleTimeout 实现
useIdleTimeout({
  timeout: 20 * 60 * 1000, // 20分钟
  onIdle: () => {
    logout();
    navigate('/login');
    message.warning('Session expired due to inactivity');
  },
  enabled: !!token,
});
```

#### 9.2.3 多标签页安全同步

| 场景          | 处理方式                                 |
| ------------- | ---------------------------------------- |
| 标签页 A 登出 | localStorage 变化触发 storage 事件       |
| 标签页 B 监听 | 检测到 token 清除，自动登出              |
| 刷新恢复      | Zustand persist 从 localStorage 恢复状态 |

#### 9.2.4 路由访问控制

```typescript

// 受保护路由 - 未登录重定向
const RequireAuth: React.FC = () => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// 公开路由 - 已登录重定向
const PublicOnly: React.FC = () => {
  const { token } = useAuthStore();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

```

### 9.3 MFA 双因素认证

#### 9.3.1 手机号变更安全流程

```
┌─────────────────────────────────────────────────────────────────┐
│ MFA 手机号变更安全流程 │
├─────────────────────────────────────────────────────────────────┤
│ │
│ 步骤 1: 密码验证 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • 用户输入当前密码 │ │
│ │ • 后端验证密码正确性 │ │
│ │ • 最多 3 次尝试，超过后强制登出 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ 步骤 2: 验证码验证 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • 发送验证码到原手机号 │ │
│ │ • 验证码有效期限制 │ │
│ │ • 重发次数限制 (最多 2 次) │ │
│ │ • 验证码尝试次数限制 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ 步骤 3: 完成变更 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • 更新手机号 │ │
│ │ • 记录审计日志 │ │
│ │ • 通知用户变更成功 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────┘

```

#### 9.3.2 安全限制措施

| 安全措施       | 限制值     | 超限处理               |
| -------------- | ---------- | ---------------------- |
| 密码错误次数   | 3 次       | 强制登出               |
| 验证码重发次数 | 2 次       | 禁止继续重发           |
| 验证码有效期   | 5 分钟     | 提示过期，需重发       |
| 账户锁定       | 多次失败后 | 显示锁定时间，强制登出 |

### 9.4 XSS 防护

#### 9.4.1 React 内置防护

| 防护机制     | 说明                                    |
| ------------ | --------------------------------------- |
| 自动转义     | React 默认对 JSX 中的变量进行 HTML 转义 |
| 禁止危险属性 | 避免使用 `dangerouslySetInnerHTML`      |
| 类型安全     | TypeScript 防止意外的类型注入           |

```typescript

// ✅ 安全：React 自动转义
<div>{userInput}</div>

// ❌ 危险：避免使用
<div dangerouslySetInnerHTML={{ __html: userInput }} />

```

#### 9.4.2 Content Security Policy (CSP)

建议在生产环境配置 CSP 响应头：

```
Content-Security-Policy:
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' https://xxx.xxx.com;
```

### 9.5 CSRF 防护

| 防护措施        | 实现方式                                     |
| --------------- | -------------------------------------------- |
| Token 验证      | JWT Token 在 Authorization Header 中传递     |
| SameSite Cookie | 后端设置 `SameSite=Strict` 或 `SameSite=Lax` |
| Origin 检查     | 后端验证请求来源                             |

> **说明**: 由于使用 JWT Token 而非 Cookie 进行认证，CSRF 攻击风险已大幅降低。

### 9.6 敏感数据处理

#### 9.6.1 数据分类

| 分类   | 数据类型              | 处理方式                        |
| ------ | --------------------- | ------------------------------- |
| 高敏感 | 密码、验证码          | 仅在提交时使用，不存储          |
| 中敏感 | JWT Token、Session ID | 存储在 localStorage，登出时清除 |
| 低敏感 | 用户邮箱、商户名      | 可显示，日志脱敏                |

#### 9.6.2 敏感信息存储

```typescript
// authStore 登出时彻底清理
logout: () => {
  set({
    user: null,
    token: null,           // 清除 Token
    sessionId: null,       // 清除 Session
    hierarchyId: null,     // 清除商户层级
    merchantId: null,      // 清除商户 ID
    // ... 清除所有敏感状态
  });
},
```

#### 9.6.3 密码安全

| 措施       | 说明                             |
| ---------- | -------------------------------- |
| 不本地存储 | 密码仅在登录/验证时临时使用      |
| 输入掩码   | 使用 `<Input.Password>` 组件     |
| 传输加密   | HTTPS 传输，密码在后端 Hash 存储 |

### 9.7 输入验证

#### 9.7.1 前端校验

| 校验类型 | 实现方式              | 示例              |
| -------- | --------------------- | ----------------- |
| 类型校验 | TypeScript 类型约束   | `email: string`   |
| 格式校验 | Ant Design Form Rules | `type: 'email'`   |
| 长度限制 | maxLength 属性        | `maxLength={100}` |
| 必填校验 | required 规则         | `required: true`  |

```typescript
// Ant Design Form 校验示例
<Form.Item
  name="email"
  rules={[
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
    { max: 100, message: '邮箱长度不能超过100字符' },
  ]}
>
  <Input maxLength={100} />
</Form.Item>
```

#### 9.7.2 防止注入攻击

| 攻击类型 | 防护措施                            |
| -------- | ----------------------------------- |
| SQL 注入 | 后端参数化查询（前端不直接操作 DB） |
| XSS 注入 | React 自动转义 + CSP                |
| 命令注入 | 后端输入验证（前端不执行命令）      |

### 9.8 传输安全

| 要求       | 配置                                        |
| ---------- | ------------------------------------------- |
| HTTPS Only | 所有 API 请求使用 HTTPS                     |
| TLS 版本   | TLS 1.2 或以上                              |
| HSTS       | 后端配置 `Strict-Transport-Security` Header |
| 证书验证   | 使用有效的 SSL/TLS 证书                     |

### 9.9 依赖安全

#### 9.9.1 npm 依赖审计

```bash
# 检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# CI/CD 集成
npm audit --audit-level=high
```

#### 9.9.2 依赖更新策略

| 策略     | 频率 | 说明                 |
| -------- | ---- | -------------------- |
| 安全补丁 | 立即 | 发现高危漏洞立即更新 |
| 次要版本 | 每月 | 定期检查更新         |
| 主要版本 | 季度 | 评估后谨慎升级       |

### 9.10 安全检查清单

#### 开发阶段

- [ ] 所有 API 调用使用 HTTPS
- [ ] 敏感数据不打印到控制台
- [ ] 避免使用 `dangerouslySetInnerHTML`
- [ ] 表单添加适当的输入验证
- [ ] 使用 TypeScript 严格模式

#### 代码审查

- [ ] 检查敏感数据处理逻辑
- [ ] 验证认证和授权逻辑
- [ ] 确认错误信息不泄露敏感信息
- [ ] 检查第三方依赖安全性

#### 部署前

- [ ] 运行 `npm audit` 无高危漏洞
- [ ] 配置适当的 CSP 策略
- [ ] 验证 HTTPS 证书有效
- [ ] 清理调试代码和日志

---

## 10. 风险与缓解

| 风险         | 影响 | 缓解措施                   |
| ------------ | ---- | -------------------------- |
| **功能遗漏** | 高   | 详细的功能对照表，UAT 测试 |
| **性能退化** | 中   | 性能基准测试，持续监控     |
| **安全漏洞** | 高   | 定期安全审计，依赖更新     |
| **学习曲线** | 低   | 文档完善，代码审查         |

---

## 11. 附录

### 11.1 浏览器支持

| 浏览器  | 最低版本 |
| ------- | -------- |
| Chrome  | 90+      |
| Firefox | 88+      |
| Safari  | 14+      |
| Edge    | 90+      |

### 11.2 相关文档

- [Login 模块规格说明](./login/spec.md)
- [Login 接口契约](./login/contracts.md)
- [Dashboard 功能规格](./dashboard/spec.md)
- [Dashboard 接口契约](./dashboard/contracts.md)
- [Dispute 功能规格](./dispute/spec.md)
- [Layout 功能规格](./layout/spec.md)

### 11.3 参考资料

- [React 19 文档](https://react.dev)
- [Vite 官方文档](https://vitejs.dev)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [TanStack Query 文档](https://tanstack.com/query)
- [Ant Design 文档](https://ant.design)
