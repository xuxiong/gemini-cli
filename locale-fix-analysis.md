# Gemini CLI 本地化问题分析与修订方案

## 问题描述

当用户将 locale 设置为中文后，部分输入框提示和界面文本仍然显示英文，未正确响应语言切换。

## 根本原因分析

通过对代码库的详细分析，发现存在多个硬编码的英文文本字符串，这些字符串没有使用本地化系统，导致语言切换时无法正确更新。

## 发现的本地化问题

### 1. Composer.tsx - 输入框占位符

- **文件位置**: `packages/cli/src/ui/components/Composer.tsx:154-158`
- **问题代码**:
  ```javascript
  placeholder={
    vimEnabled
      ? "  Press 'i' for INSERT mode and 'Esc' for NORMAL mode."
      : '  Type your message or @path/to/file'
  }
  ```
- **问题**: 硬编码的 Vim 模式和普通模式占位符文本
- **需要翻译的键**:
  - `ui.input.vimPlaceholder`
  - `ui.input.placeholder`

### 2. ApiAuthDialog.tsx - API 密钥输入框

- **文件位置**: `packages/cli/src/ui/auth/ApiAuthDialog.tsx:81`
- **问题代码**: `placeholder="Paste your API key here"`
- **问题**: 硬编码的 API 密钥输入框占位符
- **需要翻译的键**: `ui.auth.apiKeyPlaceholder`

### 3. StatsDisplay.tsx - 统计信息标题

- **文件位置**: `packages/cli/src/ui/components/StatsDisplay.tsx`
- **问题**: 多个硬编码的统计标题
- **需要翻译的键**:
  - `ui.stats.interactionSummary` - "Interaction Summary"
  - `ui.stats.sessionId` - "Session ID:"
  - `ui.stats.toolCalls` - "Tool Calls:"
  - `ui.stats.successRate` - "Success Rate:"
  - `ui.stats.userAgreement` - "User Agreement:"
  - `ui.stats.codeChanges` - "Code Changes:"
  - `ui.stats.performance` - "Performance"
  - `ui.stats.wallTime` - "Wall Time:"
  - `ui.stats.agentActive` - "Agent Active:"
  - `ui.stats.apiTime` - "API Time:"
  - `ui.stats.toolTime` - "Tool Time:"

### 4. ModelStatsDisplay.tsx - 模型统计标题

- **文件位置**: `packages/cli/src/ui/components/ModelStatsDisplay.tsx`
- **问题**: 硬编码的模型统计标题
- **需要翻译的键**:
  - `ui.modelStats.api` - "API"
  - `ui.modelStats.requests` - "Requests"
  - `ui.modelStats.errors` - "Errors"
  - `ui.modelStats.avgLatency` - "Avg Latency"
  - `ui.modelStats.tokens` - "Tokens"
  - `ui.modelStats.total` - "Total"
  - `ui.modelStats.prompt` - "Prompt"
  - `ui.modelStats.cached` - "Cached"
  - `ui.modelStats.thoughts` - "Thoughts"
  - `ui.modelStats.tool` - "Tool"
  - `ui.modelStats.output` - "Output"

### 5. SessionSummaryDisplay.tsx - 代理关闭消息

- **文件位置**: `packages/cli/src/ui/components/SessionSummaryDisplay.tsx:17`
- **问题代码**: `title="Agent powering down. Goodbye!"`
- **问题**: 硬编码的代理关闭消息
- **需要翻译的键**: `ui.session.powerDownMessage`

### 6. IdeIntegrationNudge.tsx - IDE 集成提示

- **文件位置**: `packages/cli/src/ui/IdeIntegrationNudge.tsx:64,69`
- **问题代码**: `label: "No, don't ask again"`
- **问题**: 硬编码的 IDE 集成提示文本
- **需要翻译的键**: `ui.ideIntegration.dontAskAgain`

## 修订方案

### 第一步：更新中文翻译文件

修改 `packages/cli/src/i18n/locales/zh-CN.json`，添加缺失的翻译键：

```json
{
  "ui": {
    "input": {
      "vimPlaceholder": "  按 'i' 进入 INSERT 模式，按 'Esc' 进入 NORMAL 模式。",
      "placeholder": "  输入您的消息或 @文件路径"
    },
    "auth": {
      "apiKeyPlaceholder": "在此处粘贴您的 API 密钥"
    },
    "stats": {
      "interactionSummary": "交互摘要",
      "sessionId": "会话 ID:",
      "toolCalls": "工具调用:",
      "successRate": "成功率:",
      "userAgreement": "用户同意:",
      "codeChanges": "代码更改:",
      "performance": "性能",
      "wallTime": "总时间:",
      "agentActive": "代理活跃:",
      "apiTime": "API 时间:",
      "toolTime": "工具时间:"
    },
    "modelStats": {
      "api": "API",
      "requests": "请求",
      "errors": "错误",
      "avgLatency": "平均延迟",
      "tokens": "令牌",
      "total": "总计",
      "prompt": "提示",
      "cached": "缓存",
      "thoughts": "思考",
      "tool": "工具",
      "output": "输出"
    },
    "session": {
      "powerDownMessage": "代理正在关闭。再见！"
    },
    "ideIntegration": {
      "dontAskAgain": "不，不再询问"
    }
  }
}
```

### 第二步：修改组件文件

#### 1. 修改 Composer.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../../i18n/i18n.js';

// 修改 placeholder 属性
placeholder={
  vimEnabled
    ? t('ui.input.vimPlaceholder')
    : t('ui.input.placeholder')
}
```

#### 2. 修改 ApiAuthDialog.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../../i18n/i18n.js';

// 修改 placeholder 属性
placeholder={t('ui.auth.apiKeyPlaceholder')}
```

#### 3. 修改 StatsDisplay.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../../i18n/i18n.js';

// 修改所有硬编码标题为 t() 函数调用
// 例如：
title={t('ui.stats.interactionSummary')}
```

#### 4. 修改 ModelStatsDisplay.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../../i18n/i18n.js';

// 修改所有硬编码标题为 t() 函数调用
// 例如：
title={t('ui.modelStats.api')}
```

#### 5. 修改 SessionSummaryDisplay.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../../i18n/i18n.js';

// 修改 title 属性
title={t('ui.session.powerDownMessage')}
```

#### 6. 修改 IdeIntegrationNudge.tsx

```javascript
// 在文件顶部添加导入
import { t } from '../i18n/i18n.js';

// 修改 label 属性
label={t('ui.ideIntegration.dontAskAgain')}
```

### 第三步：更新英文翻译文件

确保 `packages/cli/src/i18n/locales/en.json` 中也包含相应的翻译键，保持一致性。

## 预期效果

完成上述修改后，当用户使用 `/locale zh-CN` 命令切换语言时：

1. 输入框占位符将正确显示中文
2. API 认证对话框的提示文本将变为中文
3. 统计信息显示将使用中文标题
4. 模型统计信息将使用中文标签
5. 代理关闭消息将显示中文
6. IDE 集成提示将使用中文文本

## 测试验证

修改完成后，建议进行以下测试：

1. 启动应用，确认默认语言检测正确
2. 使用 `/locale zh-CN` 命令切换语言
3. 验证所有用户界面文本是否正确切换为中文
4. 使用 `/locale en` 命令切换回英文，确认文本正确切换

## 后续维护

建议在开发过程中：

1. 对所有用户界面文本使用本地化系统
2. 避免在代码中硬编码任何可能显示给用户的文本
3. 定期检查新增的 UI 组件是否使用本地化
4. 保持翻译文件的完整性和一致性

---

**文档版本**: 1.0  
**创建日期**: 2025-11-04  
**最后更新**: 2025-11-04
