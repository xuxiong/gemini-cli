# Project Context

## Purpose

Gemini
CLI 是一个开源的AI代理，将Gemini的强大功能直接带入终端。它提供了对Gemini模型的轻量级访问，为用户提供从提示到模型的最直接路径。该项目专为在命令行中工作的开发者设计，提供代码理解、生成和调试等功能，以及自动化的操作任务。

## Tech Stack

- TypeScript/JavaScript: 主要编程语言
- Node.js: 运行时环境 (要求 >=20.0.0)
- React: 通过Ink库构建终端UI界面
- esbuild: 构建工具
- npm workspaces: 包管理
- Vitest: 测试框架
- ESLint + Prettier: 代码规范和格式化
- Docker: 容器化支持
- Tree-sitter: 语法解析
- Ink: 终端用户界面库

## Project Conventions

### Code Style

- 遵循现有代码库的编码风格、模式和约定
- 使用ESLint和Prettier确保代码质量和格式一致性
- 提交信息遵循Conventional Commits标准
- 使用sentence case（句子大小写）作为标题格式
- 采用第二人称（"你"）来称呼读者
- 使用现在时态
- 保持段落简短且重点突出
- 为语法高亮使用适当的代码块语言标签

### Architecture Patterns

- 单体仓库结构（monorepo）：使用npm workspaces管理多个包
- 核心包分离：@google/gemini-cli-core包含核心后端逻辑，@google/gemini-cli包含命令行界面
- React组件模式：用于构建终端UI的组件化架构
- 工具协议（MCP）：支持模型上下文协议的扩展集成
- 沙箱安全：支持macOS Seatbelt、Docker和Podman进行命令隔离
- 事件驱动：基于事件的架构用于处理命令和响应

### Testing Strategy

- 单元测试：每个包目录中使用Vitest进行单元测试
- 集成测试：在integration-tests/目录中进行端到端功能验证
- 提交前检查：使用npm run preflight运行格式化、linting和所有测试
- 代码覆盖：使用Vitest进行代码覆盖率检查
- 每次提交前确保所有检查通过

### Git Workflow

- 从现有问题开始：所有PR应链接到现有的问题单
- 保持PR小而专注：一个PR解决单一具体问题或添加单一功能
- Fork和分支：Fork仓库并创建新分支进行开发
- 提交前验证：使用npm run preflight确保所有检查通过
- 文档更新：用户界面变更需要同步更新/docs目录中的相关文档
- 提交信息：遵循Conventional Commits标准

## Domain Context

- AI CLI工具：这是一个命令行AI工具，用户通过终端与AI模型交互
- 开发者工具：主要面向开发者，提供代码分析、生成和自动化功能
- 代码理解：能够分析和理解项目的代码结构和内容
- 安全沙箱：执行用户命令时提供安全的隔离环境
- Google服务集成：与Google的Gemini API和相关服务集成
- 多模态能力：支持处理文本、代码、图像等多种数据格式
- 持续对话：支持保存和恢复复杂会话的对话检查点
- 本地开发环境：在用户本地环境中运行，可以访问项目文件

## Important Constraints

- Node.js版本要求：开发环境需要Node.js ~20.19.0，生产环境需要>=20
- 安全限制：需要沙箱机制来安全执行用户命令
- API限制：需要管理Google AI API的调用频率和配额
- 平台兼容性：需要在macOS、Linux和Windows上运行
- 开源许可：遵守Apache 2.0许可证
- 文件访问限制：需要限制对用户文件系统的访问权限

## External Dependencies

- Google Gemini API: 核心AI模型服务
- Google Cloud Platform: 用于认证和API访问
- Google Search API: 用于实时信息检索
- npm registry: 包管理和发布
- Docker/Podman: 容器化沙箱支持
- Tree-sitter语言解析器: 用于代码语法分析
- 各种第三方npm包: 如@google/genai, react, ink, undici等
