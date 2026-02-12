# [Dashboard3] Constitution

## Project Overview

This project adopts a modern technology stack, dedicated to building high-quality, maintainable Web applications. Through clear coding standards and architectural constraints, we ensure code consistency, testability, and scalability.

---

## I. Tech Stack

- **Frontend Framework**: React 19 (Function Components + Hooks)
- **Build Tool**: Vite 5+
- **Programming Language**: TypeScript 5+
- **State Management**: Zustand 4+
- **UI Component Library**: Ant Design 5+ (Support React 19)
- **Server State**: TanStack Query v5+
- **HTTP Client**: Axios
- **Styling Solution**: Tailwind CSS + CSS Modules
- **Code Quality**: ESLint
- **Test Framework**: Vitest + React Testing Library
- **Code Review**: GitHub Actions

---

## II. Project Structure Standards

### 2.1 Directory Structure

```
my-react-app/
├── public/                          # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/                  # UI Component Library
│   │   ├── common/                  # Generic Components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── layout/                  # Layout Components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── features/                # Feature Components
│   │       ├── UserProfile.tsx
│   │       ├── UserForm.tsx
│   │       └── UserTable.tsx
│   │
│   ├── pages/                       # Page Components
│   │   ├── UserListPage.tsx
│   │   ├── UserDetailPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── ErrorPage.tsx
│   │
│   ├── stores/                      # Zustand State Management
│   │   ├── index.ts                 # Export all stores
│   │   ├── userStore.ts             # User state
│   │   ├── authStore.ts             # Auth state
│   │   ├── uiStore.ts               # UI state
│   │   └── types.ts                 # Store type definitions
│   │
│   ├── hooks/                       # Custom Hooks
│   │   ├── useAuth.ts               # Auth related
│   │   ├── useUsers.ts              # User related
│   │   ├── useFetch.ts              # Data fetching
│   │   ├── useLocalStorage.ts       # Local storage
│   │   └── usePagination.ts         # Pagination
│   │
│   ├── services/                    # Business Logic Services
│   │   ├── api/                     # API related
│   │   │   ├── apiClient.ts         # API client config
│   │   │   ├── userApi.ts           # User API
│   │   │   ├── authApi.ts           # Auth API
│   │   │   └── interceptors.ts      # Interceptors
│   │   ├── userService.ts           # User business logic
│   │   ├── authService.ts           # Auth business logic
│   │   └── storageService.ts        # Storage service
│   │
│   ├── utils/                       # Utility Functions
│   │   ├── format.ts                # Formatting utils
│   │   ├── validate.ts              # Validation utils
│   │   ├── transform.ts             # Data transformation
│   │   ├── constants.ts             # Constant definitions
│   │   └── helpers.ts               # Helper functions
│   │
│   ├── types/                       # TypeScript Type Definitions
│   │   ├── index.ts                 # Export all types
│   │   ├── user.ts                  # User related types
│   │   ├── auth.ts                  # Auth related types
│   │   ├── api.ts                   # API related types
│   │   └── common.ts                # Common types
│   │
│   ├── styles/                      # Global Styles
│   │   ├── index.css                # Global entry
│   │   ├── variables.css            # CSS variables
│   │   ├── reset.css                # Style reset
│   │   └── animation.css            # Animations
│   │
│   ├── config/                      # Configuration Files
│   │   ├── env.ts                   # Environment variables
│   │   ├── routes.ts                # Route configuration
│   │   └── theme.ts                 # Theme configuration
│   │
│   ├── assets/                      # Asset Files
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── router/                      # Router Configuration
│   │   ├── index.tsx                # Router entry
│   │   └── routes.tsx               # Route definitions
│   │
│   ├── App.tsx                      # Root Component
│   └── main.tsx                     # Entry File
│
├── tests/                           # Test Files
│   ├── unit/                        # Unit Tests
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── services/
│   ├── integration/                 # Integration Tests
│   └── setup.ts                     # Test Setup
│
├── .vscode/                         # VS Code Config
│   ├── extensions.json
│   ├── settings.json
│   └── launch.json
│
├── .github/                         # GitHub Config
│   └── workflows/
│       ├── ci.yml                   # CI Workflow
│       └── test.yml                 # Test Workflow
│
├── .env.example                     # Env Vars Example
├── .env.development                 # Development Env Vars
├── .env.production                  # Production Env Vars
├── .eslintrc.json                   # ESLint Config
├── .prettierrc.json                 # Prettier Config
├── .prettierignore                  # Prettier Ignore
├── .gitignore                       # Git Ignore
├── eslint.config.mjs                # ESLint Config (New Format)
├── tsconfig.json                    # TypeScript Config
├── tsconfig.app.json                # App TypeScript Config
├── tsconfig.node.json               # Node TypeScript Config
├── vite.config.ts                   # Vite Config
├── vitest.config.ts                 # Vitest Config
├── package.json                     # Project Dependencies
├── package-lock.json                # Lock File
└── README.md                        # Project Readme
```

### 2.2 Naming Conventions

**File Naming**:

- React Components: PascalCase (`UserProfile.tsx`)
- Custom Hooks: useXXX (`useUsers.ts`)
- Store Files: camelCase + Store (`userStore.ts`)
- Service Files: camelCase + Service (`userService.ts`)
- Utility Files: camelCase (`format.ts`, `validate.ts`)
- Type Definition Files: camelCase (`user.ts`, `api.ts`)
- Other Files: kebab-case (`api-client.ts`)

**Directory Naming**:

- Always use kebab-case (`user-profile/`, `api-client/`) or camelCase (`components/`, `stores/`)
- Maintain consistency throughout the project

**Variable/Function Naming**:

- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)
- Variables/Functions: camelCase (`userName`, `getUserList()`)
- Types/Interfaces: PascalCase (`User`, `UserResponse`, `UserState`)
- Private Variables: \_camelCase (`_internalValue`)
- React Components: PascalCase (`UserProfile`, `UserForm`)
- Custom Hooks: useXXX (`useUsers`, `useAuth`)

---

## III. Core Design Principles

### 3.1 Modern React Practices

Use Functional Components with Hooks exclusively. Avoid Class Components.

### 3.2 Single Responsibility Principle (SRP)

Each module, component, Hook, and Service is suggested to have only one reason to change.

**Scope**:

- Components: Responsible for UI presentation only, no business logic
- Services: Responsible for data logic and API calls only
- Hooks: Manage single state or logic
- Stores: Manage related global state only

**Example Standards**:

- ✅ Components receive Props and handle user interactions
- ✅ Services do not depend on React and can be tested independently
- ✅ Hooks return clear state and operations
- ✅ Methods in Store focus on related functionalities

### 3.3 Component modularization

Separate the data logic from the UI presentation. Follow the principle of single responsibility.

**Three-Layer Architecture**:

```
Services (Data Logic Layer)
├── Direct API Calls
├── Data Transformation & Processing
└── Independent of React

Hooks / Stores (State Management Layer)
├── Manage Component State
├── Compose Service Logic
└── React-specific Logic

Components (UI Presentation Layer)
├── Receive Props
├── Render UI
└── Handle User Interactions
```

**Prohibited Practices**:

- ❌ Direct API calls (fetch/axios) in components
- ❌ Mixing complex business logic in JSX
- ❌ Placing data transformation logic in components
- ❌ Depending on React Hooks in Services

### 3.4 State Immutability

Never mutate state directly. Always use setter functions or spread operators for array/object updates to ensure proper re-rendering.

**Object Updates**:

- ✅ `setState({ ...state, field: newValue })`
- ✅ `{ ...oldObject, field: newValue }`
- ❌ `state.field = newValue; setState(state)`

**Array Updates**:

- ✅ `[...array, newItem]` - Add
- ✅ `array.filter(item => item.id !== id)` - Delete
- ✅ `array.map(item => item.id === id ? newItem : item)` - Modify
- ❌ `array.push(item)` - Direct modification
- ❌ `array[0] = newItem` - Direct index modification

**Zustand Store Updates**:

- ✅ `set((state) => ({ users: [...state.users, newUser] }))`
- ❌ `set({ users: state.users }); state.users.push(newUser)`

**Deeply Nested Objects**:

- ✅ Use Immer middleware to simplify code
- ✅ `import { immer } from 'zustand/middleware'`
- ❌ Multi-level spread operators

### 3.5 Service and API Standards

**1. File Location**:

- Data fetching: `src/services/api/xxxApi.ts`
- Business logic: `src/services/xxxService.ts`

**2. API Resilience**

- The app must NEVER crash due to missing data. Always use Optional Chaining (?.) and provide fallback UI (e.g., placeholder images if a poster is missing).

**3. State Feedback**

- The UI must clearly communicate "Loading" states (use Skeletons, not spinners) and "Error" states to the user.

**4. Performance**

- Network calls must be efficient. Search inputs MUST be debounced (wait 500ms) to avoid hitting the API rate limit.

**5. Usage rules**

- All API calls are in Services Components only call Hooks or stores ， Hooks call Services

**6. Service Responsibilities**:

- ✅ Call API to get data
- ✅ Data transformation and processing
- ✅ Error handling
- ✅ Independent of React
- ✅ Independently testable

**7. Prohibited**:

- ❌ Directly using React Hooks
- ❌ Modifying component state
- ❌ DOM manipulation
- ❌ Mixing business logic into components

**8. API Client Configuration**:

- File location: `src/services/api/apiClient.ts`
- Unified Axios instance configuration
- Add request/response interceptors
- Global error handling

```typescript
// Example Structure
export const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor - Add token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);
```

**9. API Function Design**:

- ✅ Create separate function for each API endpoint
- ✅ Provide clear parameter and return types
- ✅ Handle common errors
- ✅ Return typed data

```typescript
// src/services/api/userApi.ts
export const userApi = {
  async getUsers(params?: { page?: number; limit?: number }) {
    return apiClient.get<User[]>('/users', { params });
  },

  async getUserById(id: number) {
    return apiClient.get<User>(`/users/${id}`);
  },

  async createUser(data: CreateUserDto) {
    return apiClient.post<User>('/users', data);
  },

  async updateUser(id: number, data: UpdateUserDto) {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  async deleteUser(id: number) {
    return apiClient.delete(`/users/${id}`);
  },
};
```

**10. Unified Error Handling**:

- ✅ Handle network errors in API interceptors
- ✅ Handle business logic errors in Services
- ✅ Store error messages in Store
- ✅ Display user-friendly error messages in components

**11. Error Type Definition**:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}
```

### 3.6 Semantic HTML

- ✅ Use correct HTML tags (button, nav, header, main, section, etc.)
- ✅ Forms use label, input, select, etc.
- ⚠️ Simulating buttons, links with div and span
- ✅ Form error messages are clear and associated with relevant fields

### 3.7 Code Quality Standards

**Type Safety**:

- ✅ 100% TypeScript coverage (no `any` type)
- ✅ Specify types for all function parameters and return values
- ✅ Define interfaces for all React Props
- ✅ Strict tsconfig.json configuration
- ❌ Using `any` type
- ❌ Implicit `any`

**Function Design**:

- ✅ Function length < 50 lines (suggest)
- ✅ Max 3 parameters (use object destructuring for more)
- ✅ Extract complex logic into separate functions
- ✅ Pure functions, no side effects
- ⚠️ Extremely long functions (> 100 lines)
- ⚠️ Multiple confusing parameters

**Component Design**:

- ✅ Component code < 100 lines (suggest)
- ✅ Clear Props interface, max 5 Props (suggest)
- ✅ One component per file
- ✅ Export as named export
- ⚠️ Defining multiple components in one file
- ❌ Default export

**Comments and Documentation**:

- ✅ Comments for complex logic explaining "Why" not "What"
- ✅ JSDoc comments for public APIs
- ✅ Usage instructions for complex Hooks or Stores
- ❌ Excessive comments (if code is clear, no need)
- ❌ Comments out of sync with code

### 3.8 UI Implementation Standards

**Ant Design First Principle**:

- ✅ **Priority Usage**: Always prioritize using Ant Design components for layouts, navigation, data entry, and feedback (e.g., `<Button>`, `<Input>`, `<Grid>`, `<Layout>`).
- ✅ **Avoid Native Tags**: Do not use native HTML tags (like `<button>`, `<input>`, `<select>`) directly if an Ant Design equivalent exists.
- ✅ **Theming**: Use `ConfigProvider` and Design Tokens for styling customization instead of writing global CSS overrides.
- ✅ **Consistency**: Follow Ant Design's design language for spacing (`margin`, `padding`) and colors to ensure visual consistency.
- ❌ **Mixed Styles**: Avoid mixing Tailwind CSS utility classes with Ant Design components unless for layout positioning (margins/padding) or when absolutely necessary.

---

## IV. React 19 Coding Standards

### 4.1 Function Components and Hooks Only

- ✅ All new components must be function components
- ✅ Use React Hooks (useState, useEffect, useCallback, etc.)
- ✅ Extract common logic into custom Hooks
- ❌ No Class Components allowed (except Error Boundaries)
- ❌ Hooks calls in conditional statements or loops
- ❌ Hooks calls in callback functions

**Error Boundary Exception**:

- The only class component exception: ErrorBoundary
- Recommend using third-party library: react-error-boundary
- If must write manually, name it ErrorBoundary

### 4.2 Hooks Usage Standards

- ✅ useState for component local state
- ✅ useEffect for side effects (API calls, subscriptions, etc.)
- ✅ useCallback to cache callback functions (avoid unnecessary re-renders)
- ✅ useMemo to cache calculation results (only for performance-critical scenarios)
- ✅ useRef to access DOM or save mutable values

**Hooks Rules**:

- ✅ Call Hooks at the top level (not in conditions, loops, nested functions)
- ✅ Call in React function components or custom Hooks
- ✅ Correctly specify dependency arrays
- ✅ Use ESLint plugin to rules: `eslint-plugin-react-hooks` (suggest)
- ❌ Conditional call: `if (condition) useState()`
- ❌ Loop call: `for () { useEffect() }`
- ❌ Nested function call: `function() { useState() }`

**Dependency Arrays**:

- ✅ useEffect explicitly lists all dependencies
- ✅ Empty dependency array means execute once on mount
- ✅ Use ESLint rule: `exhaustive-deps` (suggest)
- ❌ Missing dependencies leading to stale data
- ❌ Unnecessary dependencies causing frequent re-runs

**Custom Hooks**:

- ✅ Name starting with `use`
- ✅ Only call within components or other Hooks
- ✅ Return clear values and functions
- ✅ Complete TypeScript types
- ❌ Conditional calls of custom Hooks
- ❌ Unclear return values

### 4.3 Props Standards

**Props Definition**:

- ✅ Define TypeScript interfaces for all Props
- ✅ Interface name: ComponentName + `Props`
- ✅ Use `interface` instead of `type` (for most scenarios)
- ✅ Mark optional properties with `?`

**Props Passing**:

- ✅ Use object destructuring: `function Component({ prop1, prop2 }) {}`
- ✅ Add default values for Props (using function parameter defaults)
- ✅ Prop Drilling depth < 3 levels (otherwise use Context or Zustand)
- ❌ Passing Props deep down more than 3 levels

**Callback Props**:

- ✅ Use `on` prefix: `onClick`, `onChange`, `onSubmit`
- ✅ Provide clear parameter types
- ✅ Cache callbacks in parent component using useCallback
- Example: `onChange: (value: string) => void`

### 4.4 Conditional Rendering and List Rendering

**Conditional Rendering**:

- ✅ Use `&&` and `?:` operators
- ✅ Extract complex conditions into variables
- ✅ Extract into independent components (> 3 levels depth)

**List Rendering**:

- ✅ Use `map()` to render lists
- ✅ Provide unique key for list items (ID preferred, avoid index)
- ✅ Do not use array index in key
- ❌ `key={index}` causes performance issues and bugs

---

## V. Zustand State Management Standards

### 5.1 Store Design

**Store Location**:

- File location: `src/stores/xxxStore.ts`
- Export: `export const useXxxStore = create(...)`
- Aggregated export: `src/stores/index.ts`

**Store Naming**:

- Hook name: `use` + Feature Name + `Store` (`useUserStore`, `useAuthStore`)
- File name: Feature Name + `Store.ts` (`userStore.ts`, `authStore.ts`)

**Store Structure**:

- State fields (Data)
- Action functions (Change state)
- Computed properties (Optional, Derived state)

**Example Structure**:

```typescript
interface UserState {
  // State
  users: User[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  deleteUser: (id: number) => void;

  // Computed (Optional)
  getActiveUsers: () => User[];
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        users: [],
        loading: false,
        error: null,

        // Actions...
        fetchUsers: async () => { ... },
        addUser: (user) => set(...),
        deleteUser: (id) => set(...),

        // Computed...
        getActiveUsers: () => get().users.filter(...)
      }),
      { name: 'user-store' }
    ),
    { name: 'UserStore' }
  )
);
```

### 5.2 Store Middleware

**Mandatory Middleware**:

- ✅ `devtools` - Debugging tool, mandatory in development
- ✅ `persist` - Data persistence (localStorage)
- ✅ `immer` - Simplify deep nested object modification

**Middleware Order**:

```typescript
create<State>()(
  devtools(           // Outermost: Debugging
    persist(          // Middle: Persistence
      immer(          // Innermost: Immutability
        (set, get) => ({ ... })
      ),
      { name: 'store-name' }
    ),
    { name: 'StoreName' }
  )
);
```

### 5.3 Store Separation Principles

**When to Create a New Store**:

- ✅ Different reasons for state changes (Single Responsibility)
- ✅ Different lifecycle of state
- ✅ Completely independent functionality

**Recommended Store Splits**:

- `authStore` - Auth related (user, token, isAuthenticated)
- `userStore` - User data management (users, currentUser)
- `uiStore` - UI state (sidebarOpen, themeMode, notifications)
- `settingsStore` - App settings (language, timezone)

**Avoid Over-Splitting**:

- ❌ One Store per field
- ❌ Related state scattered across multiple Stores

### 5.4 Prohibited Practices

- ❌ Calling components directly in Store
- ❌ Depending on React Hooks in Store
- ❌ Store circular dependencies
- ❌ Calling useStore multiple times in useEffect (should subscribe once)
- ❌ Direct modification of Store state, not via set() function
- ❌ DOM manipulation in Store

## VI. Routert Standards

### 6.1 Route Configuration

**Basic Rules**

- ✅ use 'react-router-dom' v6+
- ✅ centralized management of route configuration (' routes.tsx ')
- ✅ use 'createBrowserRouter' to create a data route
- ✅ supports nested routes and 'outlets'

**Example structure**

```typescript
// src/router/routes.tsx
import { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'users',
        element: <UserListPage />,
      },
      //...
    ],
  },
];
```

### 6.2 Route Jump

**Jump Method**

- ✅ Use `<Link>` or `<NavLink>` in the component
- ✅ use `useNavigate()` Hook in logic
- ❌ use `window.location.href` less (it will cause the page to refresh completely)

**Parameter Passing**

- ✅ pass ID: `/users/:id` using URLParams
- ✅ pass the filtering condition using SearchParams: `/users? page=1`
- ✅ pass complex objects using Location State (note the risk of refresh loss)

**Routing Guard**

- ✅ create the `RequireAuth` higher-order component to wrap protected routes
- ✅ check permissions in `loader` (React Router v6.4+)

```typescript
// Routing Guard example
function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

### 6.3 Data Loading

**Recommended to use Loader (React Router v6.4+)** :

- ✅ obtain data in parallel in the route definition
- ✅ avoid the waterfall flow caused by "Render then Fetch"
- ✅ prefetch data in combination with TanStack Query

```typescript
// Data preloading example
{
    path: 'users/:id',
    element: <UserDetailPage />,
    loader: async ({ params }) => {
        return queryClient.ensureQueryData(userQuery(params.id));
    }
}
```

## Special Note:

- [IMPORTANT] Automatic modification of this document is prohibited. Only after manual review and discussion can the specifications in the document be manually added or modified
- [IMPORTANT] Annotations and prompt information must remain in English

---

**Version**: [0.1.0] | **Ratified**: [2026-01-16] | **Last Amended**: [2026-01-16]
