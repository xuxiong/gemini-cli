# npm install 错误修复指南

## 问题诊断

用户遇到的错误：

```
npm error Cannot destructure property 'package' of 'node.target' as it is null.
npm warn reify invalid or damaged lockfile detected
```

**根本原因**：

- npm全局registry被配置为私有SRDCloud服务
- 但`@srdcloud/gemini-cli`已发布到公网npmjs.org
- npm缓存和配置冲突导致package tree损坏

## ✅ 快速修复 (已验证成功)

### 一键修复脚本

```bash
#!/bin/bash
# 复制以下所有命令在终端执行

# 1. 清理npm缓存
echo "清理npm缓存..."
npm cache clean --force

# 2. 删除旧文件
echo "删除旧的lockfile和node_modules..."
rm -rf package-lock.json node_modules ~/.npm

# 3. 重置registry
echo "配置registry..."
npm config set registry https://registry.npmjs.org/

# 4. 安装
echo "安装@srdcloud/gemini-cli..."
npm install @srdcloud/gemini-cli

# 5. 验证
echo "验证安装..."
npm list @srdcloud/gemini-cli
```

### 分步修复

```bash
# 步骤1: 清理缓存
npm cache clean --force

# 步骤2: 删除旧配置
rm -rf ~/.npm
rm -f package-lock.json
rm -rf node_modules

# 步骤3: 重置npm registry为默认（公网）
npm config set registry https://registry.npmjs.org/

# 步骤4: 安装
npm install @srdcloud/gemini-cli

# 步骤5: 验证
npm list @srdcloud/gemini-cli
```

## 📋 验证安装成功

```bash
# 应该看到包已安装
npm list @srdcloud/gemini-cli
# 输出: @srdcloud/gemini-cli@0.13.0-nightly.20251118.b87626c

# 检查CLI是否可用
npx gemini --version

# 检查所有依赖
npm ls
```

## 💡 替代方案 (如果上述方案失败)

### 方案B: 指定registry临时安装

```bash
npm install @srdcloud/gemini-cli \
  --registry=https://registry.npmjs.org/ \
  --prefer-offline \
  --no-audit
```

### 方案C: 升级npm

如果npm版本较老，可能导致问题：

```bash
# 升级npm
npm install -g npm@latest

# 清理一切
rm -rf ~/.npm ~/.npmrc
cd /tmp && rm -rf *

# 重新安装
npm install @srdcloud/gemini-cli --registry=https://registry.npmjs.org/
```

### 方案D: 配置scope-specific registry (推荐长期)

如果您需要同时使用公网和私有registry：

```bash
# 恢复原来的registry配置
npm config set registry https://gz01-srdart.srdcloud.cn/npm/srdcloud/srdcloud-release-npm-virtual/

# 只为@srdcloud scope配置公网registry
npm config set @srdcloud:registry https://registry.npmjs.org/

# 现在两个registry都可用
npm install @srdcloud/gemini-cli  # 来自公网
npm install some-private-package  # 来自SRDCloud
```

## 🔍 问题排查

### 问题: 仍然出现相同错误

**尝试**：

```bash
# 彻底清理
rm -rf ~/.npm ~/.npmrc ~/.node-gyp
npm cache clean --force

# 使用离线安装
npm install @srdcloud/gemini-cli \
  --no-audit \
  --no-fund \
  --registry=https://registry.npmjs.org/
```

### 问题: 找不到@srdcloud/gemini-cli

**检查**：

- registry是否正确设置为 `https://registry.npmjs.org/`
  ```bash
  npm config get registry
  ```
- 包名是否正确（注意scope：`@srdcloud/`）
- 网络连接是否正常
  ```bash
  curl -I https://registry.npmjs.org/@srdcloud/gemini-cli
  ```

### 问题: npm版本导致的问题

**检查版本**：

```bash
npm --version  # 应该 >= 10.0.0
node --version # 应该 >= 18.0.0
```

**如果版本过旧**：

```bash
# 升级npm
npm install -g npm@latest

# 升级node (使用nvm)
nvm install --lts
nvm use --lts
```

## 📦 包信息

- **包名**: @srdcloud/gemini-cli
- **Scope**: @srdcloud
- **Registry**: https://registry.npmjs.org/
- **最新版本**: 0.13.0-nightly.20251118.b87626c
- **Node要求**: >= 20.0.0
- **已验证**: ✅ 2025-11-18 安装成功

## 📞 如果仍然有问题

1. **收集日志**：

   ```bash
   npm install @srdcloud/gemini-cli --verbose 2>&1 | tee npm-install.log
   ```

2. **查看日志**：

   ```bash
   cat ~/.npm/_logs/latest-debug-*.log
   ```

3. **报告信息**（包含以下内容）：
   - npm版本: `npm --version`
   - Node版本: `node --version`
   - 操作系统: `uname -a`
   - npm config: `npm config list`
   - 错误日志的完整内容
