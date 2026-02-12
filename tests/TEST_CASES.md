# Dashboard3 测试用例文档

## 1. 单元测试用例

### 1.1 货币工具 (currency.ts)

#### TC-CURR-001: 获取货币符号

| 用例ID         | 输入        | 预期输出    | 说明             |
| -------------- | ----------- | ----------- | ---------------- |
| TC-CURR-001-01 | `'USD'`     | `'$'`       | 美元符号         |
| TC-CURR-001-02 | `'CNY'`     | `'¥'`       | 人民币符号       |
| TC-CURR-001-03 | `'EUR'`     | `'€'`       | 欧元符号         |
| TC-CURR-001-04 | `'UNKNOWN'` | `'UNKNOWN'` | 未知货币返回原值 |

#### TC-CURR-002: 获取货币小数位

| 用例ID         | 输入    | 预期输出 | 说明                |
| -------------- | ------- | -------- | ------------------- |
| TC-CURR-002-01 | `'USD'` | `2`      | 标准货币2位小数     |
| TC-CURR-002-02 | `'JPY'` | `0`      | 日元无小数          |
| TC-CURR-002-03 | `'KRW'` | `0`      | 韩元无小数          |
| TC-CURR-002-04 | `'KWD'` | `3`      | 科威特第纳尔3位小数 |

#### TC-CURR-003: 验证货币金额

| 用例ID         | 输入                 | 预期输出           | 说明               |
| -------------- | -------------------- | ------------------ | ------------------ |
| TC-CURR-003-01 | `('100.50', 'USD')`  | `{ valid: true }`  | 有效美元金额       |
| TC-CURR-003-02 | `('abc', 'USD')`     | `{ valid: false }` | 无效数字           |
| TC-CURR-003-03 | `('-10', 'USD')`     | `{ valid: false }` | 负数金额           |
| TC-CURR-003-04 | `('100.555', 'USD')` | `{ valid: false }` | 超过小数位限制     |
| TC-CURR-003-05 | `('100', 'JPY')`     | `{ valid: true }`  | 有效日元（无小数） |
| TC-CURR-003-06 | `('100.5', 'JPY')`   | `{ valid: false }` | 日元不应有小数     |

#### TC-CURR-004: 格式化货币显示

| 用例ID         | 输入               | 预期输出      | 说明       |
| -------------- | ------------------ | ------------- | ---------- |
| TC-CURR-004-01 | `(1234.56, 'USD')` | `'$1,234.56'` | 美元格式化 |
| TC-CURR-004-02 | `(1234, 'JPY')`    | `'¥1,234'`    | 日元无小数 |
| TC-CURR-004-03 | `(0, 'USD')`       | `'$0.00'`     | 零值显示   |

---

### 1.2 Dashboard 工具 (dashboard.ts)

#### TC-DASH-001: 解析用户配置

| 用例ID         | 输入                | 预期输出        | 说明               |
| -------------- | ------------------- | --------------- | ------------------ |
| TC-DASH-001-01 | `'{}'`              | `{}`            | 空配置             |
| TC-DASH-001-02 | `'{"key":"value"}'` | `{key:'value'}` | 有效JSON           |
| TC-DASH-001-03 | `'invalid'`         | `{}`            | 无效JSON返回空对象 |
| TC-DASH-001-04 | `''`                | `{}`            | 空字符串返回空对象 |
| TC-DASH-001-05 | `null`              | `{}`            | null返回空对象     |

#### TC-DASH-002: 日报详情可点击判断

| 用例ID         | config                             | merchantId  | 预期输出 | 说明                 |
| -------------- | ---------------------------------- | ----------- | -------- | -------------------- |
| TC-DASH-002-01 | `{}`                               | `'123'`     | `true`   | 有merchantId可点击   |
| TC-DASH-002-02 | `{}`                               | `undefined` | `false`  | 无merchantId不可点击 |
| TC-DASH-002-03 | `{detail_daily_report_disable:''}` | `'123'`     | `false`  | 配置禁用             |

#### TC-DASH-003: 月报详情可点击判断

| 用例ID         | config                               | merchantId  | 预期输出 | 说明                 |
| -------------- | ------------------------------------ | ----------- | -------- | -------------------- |
| TC-DASH-003-01 | `{}`                                 | `'123'`     | `true`   | 有merchantId可点击   |
| TC-DASH-003-02 | `{}`                                 | `undefined` | `false`  | 无merchantId不可点击 |
| TC-DASH-003-03 | `{detail_monthly_report_disable:''}` | `'123'`     | `false`  | 配置禁用             |

#### TC-DASH-004: Payout列显示判断

| 用例ID         | 输入                | 预期输出 | 说明         |
| -------------- | ------------------- | -------- | ------------ |
| TC-DASH-004-01 | `'634201701345000'` | `true`   | 白名单商户   |
| TC-DASH-004-02 | `'000000000000000'` | `false`  | 非白名单商户 |
| TC-DASH-004-03 | `undefined`         | `false`  | 无merchantId |

#### TC-DASH-005: 获取当前日期/月份

| 用例ID         | 函数                      | 预期格式       | 说明     |
| -------------- | ------------------------- | -------------- | -------- |
| TC-DASH-005-01 | `getCurrentDateString()`  | `'YYYY-MM-DD'` | 日期格式 |
| TC-DASH-005-02 | `getCurrentMonthString()` | `'YYYYMM'`     | 月份格式 |

---

### 1.3 Transaction Lookup 工具 (transactionLookup.ts)

#### TC-TXN-001: Action按钮显示（UPI记录）

| 用例ID        | record 条件                                       | 预期                                  | 说明        |
| ------------- | ------------------------------------------------- | ------------------------------------- | ----------- |
| TC-TXN-001-01 | type=charge, status=authorized, auth_remaining>0  | showCapture=true                      | 显示Capture |
| TC-TXN-001-02 | type=charge, status=success, canRefund, balance>0 | showRefund=true                       | 显示Refund  |
| TC-TXN-001-03 | type=charge, status=authorized, captured<=0       | showCancel=true                       | 显示Cancel  |
| TC-TXN-001-04 | status=pending                                    | showStatus=true, statusText='pending' | 显示状态    |

#### TC-TXN-002: 支付网关特殊处理

| 用例ID        | gateway       | method      | 预期              | 说明                  |
| ------------- | ------------- | ----------- | ----------------- | --------------------- |
| TC-TXN-002-01 | `'wechatpay'` | `'wechat'`  | showCapture=false | 微信支付无Capture     |
| TC-TXN-002-02 | `'upop'`      | `'card'`    | showCapture=true  | 银联卡有Capture       |
| TC-TXN-002-03 | `'sbps'`      | `'linepay'` | showCapture=false | SBPS LinePay无Capture |

---

### 1.4 Hooks

#### TC-HOOK-001: useDebounce

| 用例ID         | 场景               | 预期             | 说明             |
| -------------- | ------------------ | ---------------- | ---------------- |
| TC-HOOK-001-01 | 初始渲染           | 返回初始值       | 防抖值等于输入值 |
| TC-HOOK-001-02 | 值快速变化         | 延迟后返回最新值 | 300ms后更新      |
| TC-HOOK-001-03 | 延迟时间内多次变化 | 只返回最后一个值 | 中间值被忽略     |

#### TC-HOOK-002: useIdleTimeout

| 用例ID         | 场景          | 预期                | 说明         |
| -------------- | ------------- | ------------------- | ------------ |
| TC-HOOK-002-01 | 无用户活动    | timeout后调用onIdle | 20分钟后触发 |
| TC-HOOK-002-02 | 有鼠标移动    | 重置定时器          | 不触发onIdle |
| TC-HOOK-002-03 | enabled=false | 不设置定时器        | 不监听事件   |

---

### 1.5 Stores

#### TC-STORE-001: authStore

| 用例ID          | Action      | 预期                         | 说明         |
| --------------- | ----------- | ---------------------------- | ------------ |
| TC-STORE-001-01 | login成功   | 设置user, token, sessionId   | 登录状态更新 |
| TC-STORE-001-02 | login失败   | 设置error, user=null         | 错误处理     |
| TC-STORE-001-03 | logout      | 清空所有状态                 | 登出清理     |
| TC-STORE-001-04 | setMerchant | 更新merchantId, merchantName | 商户切换     |

#### TC-STORE-002: themeStore

| 用例ID          | Action           | 预期                 | 说明         |
| --------------- | ---------------- | -------------------- | ------------ |
| TC-STORE-002-01 | 初始状态         | currentTheme='light' | 默认亮色主题 |
| TC-STORE-002-02 | toggleTheme      | light→dark→light     | 切换主题     |
| TC-STORE-002-03 | setTheme('dark') | currentTheme='dark'  | 直接设置主题 |

---

### 1.6 组件

#### TC-COMP-001: DateFilter

| 用例ID         | 操作         | 预期                     | 说明         |
| -------------- | ------------ | ------------------------ | ------------ |
| TC-COMP-001-01 | 渲染         | 显示日期选择器和搜索按钮 | UI正确渲染   |
| TC-COMP-001-02 | 选择日期     | 调用onChange回调         | 日期变化触发 |
| TC-COMP-001-03 | 点击搜索     | 调用onSearch回调         | 搜索触发     |
| TC-COMP-001-04 | loading=true | 搜索按钮显示loading      | 加载状态     |

#### TC-COMP-002: DownloadButtons

| 用例ID         | Props                       | 预期               | 说明         |
| -------------- | --------------------------- | ------------------ | ------------ |
| TC-COMP-002-01 | hasData=true, onDownloadCSV | 显示CSV按钮        | 有数据有回调 |
| TC-COMP-002-02 | hasData=false               | 不渲染组件         | 无数据不显示 |
| TC-COMP-002-03 | downloadingCSV=true         | CSV按钮显示loading | 下载中状态   |

#### TC-COMP-003: ThemeSwitcher

| 用例ID         | 操作        | 预期            | 说明     |
| -------------- | ----------- | --------------- | -------- |
| TC-COMP-003-01 | 渲染(light) | 显示月亮图标    | 亮色主题 |
| TC-COMP-003-02 | 渲染(dark)  | 显示太阳图标    | 暗色主题 |
| TC-COMP-003-03 | 点击切换    | 调用toggleTheme | 主题切换 |

---

## 2. 集成测试用例

### 2.1 登录流程 (IT-AUTH)

| 用例ID      | 场景     | 步骤                            | 预期结果           |
| ----------- | -------- | ------------------------------- | ------------------ |
| IT-AUTH-001 | 正常登录 | 1. 输入邮箱密码 2. 点击登录     | 跳转到Dashboard    |
| IT-AUTH-002 | 登录失败 | 1. 输入错误密码 2. 点击登录     | 显示错误提示       |
| IT-AUTH-003 | MFA验证  | 1. 登录成功需MFA 2. 输入验证码  | 验证通过后跳转     |
| IT-AUTH-004 | 会话超时 | 1. 登录成功 2. 等待20分钟无操作 | 自动登出到登录页   |
| IT-AUTH-005 | 主动登出 | 1. 点击用户菜单 2. 点击登出     | 清空状态跳转登录页 |

### 2.2 Transaction Lookup (IT-TXN)

| 用例ID     | 场景        | 步骤                                            | 预期结果         |
| ---------- | ----------- | ----------------------------------------------- | ---------------- |
| IT-TXN-001 | 搜索交易    | 1. 选择日期范围 2. 输入关键词 3. 点击搜索       | 显示搜索结果表格 |
| IT-TXN-002 | 分页切换    | 1. 搜索后有多页结果 2. 点击下一页               | 加载第二页数据   |
| IT-TXN-003 | 列配置      | 1. 点击列配置 2. 取消勾选某列 3. 点击应用       | 表格隐藏该列     |
| IT-TXN-004 | Refund操作  | 1. 找到可退款记录 2. 点击Refund 3. 输入金额确认 | 弹窗提示成功     |
| IT-TXN-005 | Capture操作 | 1. 找到可Capture记录 2. 点击Capture 3. 确认     | 弹窗提示成功     |

### 2.3 主题切换 (IT-THEME)

| 用例ID       | 场景       | 步骤                    | 预期结果            |
| ------------ | ---------- | ----------------------- | ------------------- |
| IT-THEME-001 | 切换主题   | 1. 点击主题切换按钮     | 页面切换为暗色/亮色 |
| IT-THEME-002 | 主题持久化 | 1. 切换主题 2. 刷新页面 | 主题保持不变        |

---

## 3. 测试优先级

### P0 - 必须通过

- TC-CURR-003 (金额验证)
- TC-DASH-002 (日报权限)
- TC-STORE-001 (登录状态)
- IT-AUTH-001 (正常登录)
- IT-AUTH-004 (会话超时)

### P1 - 重要

- TC-TXN-001 (Action按钮)
- TC-HOOK-001 (防抖)
- IT-TXN-001 (搜索交易)
- IT-TXN-004 (Refund操作)

### P2 - 一般

- TC-CURR-001 (货币符号)
- TC-COMP-001 (DateFilter)
- IT-THEME-001 (主题切换)
