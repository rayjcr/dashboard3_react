# Dashboard3 测试文档

## 测试框架

- **Vitest**: 测试运行器，与 Vite 无缝集成
- **React Testing Library**: 组件测试
- **MSW (Mock Service Worker)**: API Mock
- **@testing-library/user-event**: 用户交互模拟

## 目录结构

```
tests/
├── README.md                    # 测试文档（本文件）
├── TEST_CASES.md               # 测试用例文档
├── setup.ts                    # 测试环境配置
├── mocks/                      # Mock 数据和处理器
│   ├── handlers.ts             # MSW API handlers
│   └── server.ts               # MSW server 配置
├── unit/                       # 单元测试
│   ├── utils/                  # 工具函数测试
│   │   ├── currency.test.ts    # 货币工具测试
│   │   ├── dashboard.test.ts   # Dashboard 工具测试
│   │   └── transactionLookup.test.ts
│   ├── hooks/                  # Hooks 测试
│   │   ├── useDebounce.test.ts
│   │   └── useIdleTimeout.test.ts
│   ├── stores/                 # Store 测试
│   │   ├── authStore.test.ts
│   │   └── themeStore.test.ts
│   └── components/             # 组件单元测试
│       ├── DateFilter.test.tsx
│       ├── DownloadButtons.test.tsx
│       └── ThemeSwitcher.test.tsx
└── integration/                # 集成测试
    ├── auth/                   # 认证流程测试
    │   └── login.test.tsx
    └── dashboard/              # Dashboard 流程测试
        └── transactionLookup.test.tsx
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行测试（watch 模式）
npm test -- --watch

# 运行特定测试文件
npm test -- tests/unit/utils/currency.test.ts

# 运行覆盖率报告
npm test -- --coverage

# 运行单元测试
npm test -- tests/unit

# 运行集成测试
npm test -- tests/integration
```

## 测试覆盖范围

### 单元测试 (Unit Tests)

| 类别       | 模块                 | 覆盖功能                         |
| ---------- | -------------------- | -------------------------------- |
| Utils      | currency.ts          | 货币格式化、金额验证、小数位处理 |
| Utils      | dashboard.ts         | 用户配置解析、日期工具、权限判断 |
| Utils      | transactionLookup.ts | Action 按钮逻辑、支付方式格式化  |
| Hooks      | useDebounce          | 值防抖、延迟更新                 |
| Hooks      | useIdleTimeout       | 空闲检测、定时器重置             |
| Stores     | authStore            | 登录、登出、状态管理             |
| Stores     | themeStore           | 主题切换、状态持久化             |
| Components | DateFilter           | 日期选择、搜索触发               |
| Components | DownloadButtons      | 下载按钮渲染、加载状态           |
| Components | ThemeSwitcher        | 主题切换交互                     |

### 集成测试 (Integration Tests)

| 场景               | 描述                           |
| ------------------ | ------------------------------ |
| 登录流程           | 完整的登录、MFA 验证、登出流程 |
| Transaction Lookup | 搜索、筛选、分页、操作完整流程 |

## 编写测试指南

### 单元测试模式

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 组件测试模式

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '@/components/ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<ComponentName onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### Hook 测试模式

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '@/hooks/useCustomHook';

describe('useCustomHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(initialValue);
  });
});
```

## 测试最佳实践

1. **测试行为，而非实现** - 测试组件的用户可见行为
2. **使用语义化查询** - 优先使用 `getByRole`, `getByLabelText`
3. **避免测试实现细节** - 不测试内部状态或私有方法
4. **每个测试独立** - 测试之间不应有依赖
5. **Mock 外部依赖** - API 调用、定时器等应该 Mock
