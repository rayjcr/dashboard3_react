# Dashboard3

This project is created based on the constitution.md guidelines.

## Tech Stack

- React 19
- Vite 5+
- TypeScript 5+
- Zustand 4+
- TanStack Query v5+
- Tailwind CSS

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Lint code

### Testing

- `npm run test`: Run tests in watch mode
- `npm run test:run`: Run tests once
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:ui`: Run tests with Vitest UI

## Testing

### 测试框架

- **Vitest**: 测试运行器，与 Vite 无缝集成
- **React Testing Library**: 组件测试
- **MSW (Mock Service Worker)**: API 模拟
- **@testing-library/user-event**: 用户交互模拟

### 测试目录结构

```
tests/
├── setup.ts                 # 测试配置和全局设置
├── TEST_CASES.md           # 测试用例文档
├── coverage/               # 覆盖率报告（生成后）
├── mocks/
│   ├── handlers.ts         # MSW API 处理器
│   └── server.ts           # MSW 服务器配置
├── unit/
│   ├── components/         # 组件单元测试
│   ├── hooks/              # Hook 测试
│   ├── stores/             # Zustand Store 测试
│   └── utils/              # 工具函数测试
└── integration/
    ├── auth/               # 认证流程集成测试
    └── dashboard/          # Dashboard 功能集成测试
```

### 测试覆盖

| 类别        | 测试文件数 | 测试用例数 |
| ----------- | ---------- | ---------- |
| Utils       | 3          | 68         |
| Hooks       | 2          | 15         |
| Stores      | 2          | 17         |
| Components  | 3          | 22         |
| Integration | 2          | 11         |
| **Total**   | **12**     | **133**    |

### 运行测试

```bash
# 运行所有测试
npm test

# 单次运行（不监听）
npm run test:run

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- tests/unit/utils/currency.test.ts

# 运行匹配模式的测试
npm test -- --grep "formatCurrency"
```

### 查看覆盖率报告

运行 `npm run test:coverage` 后，HTML 报告会生成在 `tests/coverage/` 目录下。
用浏览器打开 `tests/coverage/index.html` 查看详细覆盖率报告。
