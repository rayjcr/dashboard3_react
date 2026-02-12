# Dashboard3 Technical Design Document

> **Version**: 1.0  
> **Created**: 2026-02-05  
> **Author**: Dashboard Team  
> **Status**: In Progress

---

## 1. Overview

### 1.1 Project Background

Dashboard3 is a frontend refactoring project for the Citcon Merchant Management Portal. The original system was built with **Angular 5.2** and has faced the following challenges over years of iteration:

- **Technical Debt Accumulation**: Angular 5.2 official support ended in 2018, posing security vulnerability risks
- **Outdated Dependencies**: Many third-party libraries cannot be upgraded and are incompatible with modern toolchains
- **Low Development Efficiency**: Slow build times and poor developer experience
- **High Maintenance Costs**: Legacy code structure makes new feature development and bug fixes difficult
- **Hiring Difficulties**: Angular 5.x developers are scarce

### 1.2 Project Scope

This refactoring covers all frontend functional modules of the merchant management portal:

| Module                      | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| **User Authentication**     | Login, logout, session management, MFA two-factor authentication       |
| **Dashboard**               | Transaction summary, daily reports, monthly reports, settlement status |
| **Transaction Lookup**      | Transaction search, refund, capture, cancel                            |
| **Dispute Management**      | Dispute list, dispute details, file upload                             |
| **Alipay Direct**           | Alipay direct settlement                                               |
| **Multi Fundings**          | Multi-channel funding settlement                                       |
| **Reserve Summary**         | Reserve fund summary                                                   |
| **Smart Gateway**           | Smart gateway management                                               |
| **All Transactions Search** | Global transaction search                                              |
| **Account Settings**        | Account settings, password change, phone number change                 |

---

## 2. Goals

### 2.1 Business Goals

| Goal                         | Description                                              | Measurement                                       |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| **Improve User Experience**  | Modern UI/UX, faster response                            | Lighthouse score comparison with legacy system    |
| **Reduce Maintenance Costs** | Standardized code structure, comprehensive documentation | Improved code readability, better debugging tools |
| **Enhance Security**         | Eliminate known security vulnerabilities                 | `npm audit` with no critical vulnerabilities      |
| **Support Mobile Devices**   | Responsive design, mobile-friendly                       | Support mainstream mobile devices                 |

> **Note**: The above measurements are for post-project validation, not predetermined quantitative metrics.

### 2.2 Technical Goals

| Goal                              | Description                                                      |
| --------------------------------- | ---------------------------------------------------------------- |
| **Modern Tech Stack**             | Adopt mainstream React 19 + TypeScript + Vite stack              |
| **Type Safety**                   | 100% TypeScript coverage, eliminate `any` types                  |
| **Component-based Architecture**  | High cohesion, low coupling component design                     |
| **Standardized State Management** | Unified use of Zustand for global state management               |
| **API Layer Abstraction**         | Unified API layer with interceptors and error handling           |
| **Test Coverage**                 | Core business logic unit test coverage > 80%                     |
| **Build Optimization**            | Production bundle < 500KB (gzipped), first contentful paint < 2s |

### 2.3 Non-Goals (Out of Scope)

- Backend API refactoring
- Database architecture changes
- Business logic changes (maintain feature parity)

---

## 3. Technology Selection

### 3.1 Tech Stack Comparison

| Dimension            | Legacy System (Angular 5.2) | New System (React 19)        |
| -------------------- | --------------------------- | ---------------------------- |
| **Framework**        | Angular 5.2 (2017)          | React 19 (2024)              |
| **Language**         | TypeScript 2.x              | TypeScript 5.6               |
| **Build Tool**       | Webpack 3                   | Vite 6                       |
| **State Management** | RxJS + Services             | Zustand 4                    |
| **Data Fetching**    | HttpClient                  | Axios + TanStack Query       |
| **UI Framework**     | Angular Material            | Ant Design 6                 |
| **CSS Solution**     | SCSS                        | Tailwind CSS + CSS Variables |
| **Router**           | Angular Router              | React Router 6               |
| **Testing**          | Karma + Jasmine             | Vitest + Testing Library     |

### 3.2 Selection Rationale

#### React 19

- **Mature Ecosystem**: Largest frontend ecosystem with rich third-party library support
- **Abundant Developer Resources**: Easy hiring, active community
- **React 19 New Features**: Server Components, automatic batching, concurrent rendering

#### Vite

- **Ultra-fast Development Experience**: Cold start < 1s, instant HMR
- **Optimized Production Build**: Rollup-based, excellent Tree Shaking
- **Native ESM Support**: Faster module resolution

#### Zustand

- **Lightweight**: < 2KB, no boilerplate
- **TypeScript Friendly**: Complete type inference
- **Middleware System**: Supports persistence, dev tools
- **Compared to Redux**: 80% less boilerplate code

#### TanStack Query

- **Server State Management**: Automatic caching, background refresh
- **Reduced Requests**: Smart deduplication, retry on failure
- **Developer Experience**: DevTools visualization

#### Ant Design 6

- **Enterprise Component Library**: Covers all components needed for Dashboard
- **Internationalization Support**: Built-in multi-language
- **Theme Customization**: CSS Variables + Design Token

---

## 4. System Architecture

### 4.1 Overall Architecture

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

### 4.2 Directory Structure

```
src/
├── assets/              # Static assets
│   ├── fonts/           # Font files
│   ├── icons/           # Icons
│   └── images/          # Images
├── components/          # Reusable components
│   ├── auth/            # Authentication components
│   ├── common/          # Common components
│   ├── dashboard/       # Dashboard business components
│   ├── layout/          # Layout components
│   └── features/        # Feature components
├── config/              # Configuration files
│   ├── env.ts           # Environment configuration
│   └── userMenu.ts      # Menu configuration
├── hooks/               # Custom Hooks
├── pages/               # Page components
├── router/              # Route configuration
├── services/            # Service layer
│   └── api/             # API interfaces
├── stores/              # Zustand Stores
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### 4.3 State Management Architecture

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

## 5. Core Design

### 5.1 Authentication Design

#### Authentication Flow

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

#### Security Features

| Feature            | Implementation                                                    |
| ------------------ | ----------------------------------------------------------------- |
| **Idle Timeout**   | `useIdleTimeout` Hook, auto logout after 20 minutes of inactivity |
| **Token Storage**  | localStorage + Zustand persist middleware                         |
| **Route Guards**   | `RequireAuth` / `PublicOnly` component wrappers                   |
| **Multi-tab Sync** | `storage` event listener, cross-tab state synchronization         |
| **MFA Support**    | Two-factor authentication, phone verification code                |

### 5.2 Routing Design

```typescript
// Route Structure
/                          # Redirect to /dashboard
/login                     # Login page (PublicOnly)
/dashboard                 # Dashboard (RequireAuth)
/daily-detail/:date        # Daily detail report
/alltransactions           # Global transaction search
/accountsettings           # Account settings
/auth-callback             # OAuth callback
/*                         # 404 page
```

### 5.3 Component Design Principles

| Principle                        | Description                                                     |
| -------------------------------- | --------------------------------------------------------------- |
| **Single Responsibility**        | Each component does one thing                                   |
| **Props Down**                   | Data passed via Props, use Context/Store to avoid prop drilling |
| **State Lifting**                | Lift shared state to nearest common ancestor or Store           |
| **Composition over Inheritance** | Use children and render props                                   |
| **Controlled Components**        | Forms managed by Ant Design Form                                |

### 5.4 API Design

#### Request Interceptor

```typescript
// Auto-inject authentication info
apiClient.interceptors.request.use((config) => {
  const token = getAuthStore().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor

```typescript
// Unified error handling
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

## 6. Migration Strategy

### 6.1 Migration Approach

Adopting a **complete rewrite** strategy rather than incremental migration:

| Consideration                       | Decision                                         |
| ----------------------------------- | ------------------------------------------------ |
| **Large Framework Difference**      | Angular → React cannot be migrated incrementally |
| **Significant Technical Debt**      | Rewrite allows thorough cleanup                  |
| **Relatively Independent Business** | Merchant portal can be deployed independently    |
| **Time Window**                     | Sufficient time to complete full rewrite         |

### 6.2 Feature Parity Verification

| Verification Method       | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| **Screenshot Comparison** | Compare UI screenshots of old and new systems          |
| **API Contract**          | Ensure same APIs are called with consistent parameters |
| **E2E Testing**           | Automated testing of critical flows                    |
| **UAT Testing**           | User acceptance testing                                |

### 6.3 Launch Plan

```
Phase 1: Development & Internal Testing
  └── Complete core feature development
  └── Unit test coverage
  └── Internal QA testing

Phase 2: Beta Testing
  └── Gradual rollout to subset of users
  └── Collect feedback
  └── Bug fixes

Phase 3: Production Launch
  └── Full traffic switch
  └── Decommission legacy system
  └── Monitoring and alerting
```

---

## 7. Performance Optimization

### 7.1 Build Optimization

| Optimization              | Approach                                      |
| ------------------------- | --------------------------------------------- |
| **Code Splitting**        | Route-level lazy loading                      |
| **Tree Shaking**          | Only bundle used code                         |
| **Compression**           | Terser + Gzip/Brotli                          |
| **External Dependencies** | CDN loading for large dependencies (optional) |

### 7.2 Runtime Optimization

| Optimization          | Approach                                 |
| --------------------- | ---------------------------------------- |
| **Virtual Lists**     | Virtual scrolling for large data tables  |
| **Request Caching**   | TanStack Query automatic caching         |
| **Debounce/Throttle** | Search input debouncing                  |
| **Memoization**       | `React.memo` / `useMemo` / `useCallback` |

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
        ┌───────────┐
        │   E2E     │  Few critical flows
        │   Tests   │
        ├───────────┤
        │Integration│  Component integration tests
        │   Tests   │
        ├───────────┤
        │   Unit    │  Many unit tests
        │   Tests   │  Utils/Hooks/Stores
        └───────────┘
```

### 8.2 Testing Tools

| Level           | Tool                  |
| --------------- | --------------------- |
| Unit Tests      | Vitest                |
| Component Tests | Testing Library       |
| E2E Tests       | Playwright (optional) |

---

## 9. Risks and Mitigation

| Risk                       | Impact | Mitigation                                      |
| -------------------------- | ------ | ----------------------------------------------- |
| **Feature Omission**       | High   | Detailed feature comparison table, UAT testing  |
| **Performance Regression** | Medium | Performance benchmarking, continuous monitoring |
| **Browser Compatibility**  | Medium | Clear support list, automated testing           |
| **Learning Curve**         | Low    | Comprehensive documentation, code reviews       |

---

## 10. Appendix

### 10.1 Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 88+             |
| Safari  | 14+             |
| Edge    | 90+             |

### 10.2 Related Documents

- [Login Module Specification](./login/spec.md)
- [Login API Contracts](./login/contracts.md)
- [Dashboard Specification](./dashboard/spec.md)
- [Dashboard API Contracts](./dashboard/contracts.md)
- [Dispute Specification](./dispute/spec.md)
- [Layout Specification](./layout/spec.md)

### 10.3 References

- [React 19 Documentation](https://react.dev)
- [Vite Official Documentation](https://vitejs.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Ant Design Documentation](https://ant.design)
