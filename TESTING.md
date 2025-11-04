# 项目测试指南

这个项目使用 Vitest 作为测试框架，采用多包架构。

## 测试结构

项目采用多包架构，每个包都有自己的测试配置：

- **单元测试**：在各个包的 `src` 目录下的 `.test.ts/.test.tsx` 文件
- **集成测试**：在 `integration-tests/` 目录
- **脚本测试**：在 `scripts/tests/` 目录

## 测试命令

主要测试命令如下：

```bash
# 运行所有测试（所有工作区）
npm run test

# CI 环境运行测试
npm run test:ci

# 运行脚本测试
npm run test:scripts

# 运行集成测试（无沙盒）
npm run test:integration:sandbox:none

# 运行集成测试（Docker 沙盒）
npm run test:integration:sandbox:docker

# 运行集成测试（Podman 沙盒）
npm run test:integration:sandbox:podman

# 端到端测试
npm run test:e2e

# 运行所有集成测试
npm run test:integration:all
```

## 运行单个包的测试

也可以进入特定包目录运行测试：

```bash
cd packages/core
npm run test

cd packages/cli
npm run test

cd packages/a2a-server
npm run test

cd packages/test-utils
npm run test

cd packages/vscode-ide-companion
npm run test
```

## 测试覆盖范围

测试覆盖了：

- 核心工具功能（文件操作、搜索、Git 等）
- UI 组件（React 组件）
- 配置和设置
- MCP（Model Context Protocol）集成
- 服务功能（文件系统、Shell 执行等）
- 身份验证和授权
- 会话管理
- 配置管理

## 测试配置文件

各个包的测试配置文件：

```
scripts/tests/vitest.config.ts          # 脚本测试配置
packages/test-utils/vitest.config.ts    # 测试工具配置
packages/core/vitest.config.ts          # 核心包配置
packages/cli/vitest.config.ts           # CLI 包配置
packages/a2a-server/vitest.config.ts    # A2A 服务器配置
integration-tests/vitest.config.ts      # 集成测试配置
```

## 集成测试说明

集成测试使用沙盒环境：

- **无沙盒模式**：直接运行在本地环境
- **Docker 沙盒**：使用 Docker 容器隔离测试环境
- **Podman 沙盒**：使用 Podman 容器隔离测试环境

集成测试包含：

- 文件系统操作测试
- 上下文压缩测试
- 扩展安装测试
- MCP 服务器集成测试
- 标准输入/输出测试
- 终端操作测试

## 调试测试

要调试失败的测试，可以使用：

```bash
# 运行特定测试文件
npm run test -- --run packages/core/src/utils/paths.test.ts

# 调试模式运行
npm run test -- --inspect-brk

# 只运行失败的测试
npm run test -- --reporter=verbose
```

## 预提交检查

项目配置了预提交钩子，在提交前会自动运行：

```bash
npm run pre-commit
```

这将运行：

- 代码格式化
- ESLint 检查
- 类型检查
- 测试运行

## 测试最佳实践

1. 使用描述性的测试名称
2. 每个测试用例应该独立运行
3. 使用 `describe` 和 `it` 组织测试结构
4. 利用 Vitest 的 `beforeEach` 和 `afterEach` 进行测试清理
5. 对异步操作使用 `async/await`

所有测试都使用 Vitest 配置，支持 TypeScript 和 ES 模块。
