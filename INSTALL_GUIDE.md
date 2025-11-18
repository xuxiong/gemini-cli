# @srdcloud/gemini-cli 安装指南

## 问题分析

您遇到的错误：

```
npm error Cannot destructure property 'package' of 'node.target' as it is null.
```

这通常是由以下原因引起：

1. **npm registry配置冲突** - 您的系统配置了私有npm registry (SRDCloud)
2. **npm缓存损坏** - 旧的缓存与新包冲突
3. **node_modules损坏** - 之前的安装留下了不兼容的依赖

## 解决方案

### 方案A: 快速修复 (推荐)

```bash
# 1. 清理npm缓存
npm cache clean --force

# 2. 删除旧文件
rm -rf package-lock.json node_modules ~/.npm

# 3. 重置npm registry到公网
npm config set registry https://registry.npmjs.org/

# 4. 安装包
npm install @srdcloud/gemini-cli
```

### 方案B: 指定registry安装 (临时方案)

```bash
npm install @srdcloud/gemini-cli \
  --registry=https://registry.npmjs.org/ \
  --no-save
```

### 方案C: 升级npm (如果方案A失败)

```bash
# 升级npm到最新版本
npm install -g npm@latest

# 清理所有缓存
rm -rf ~/.npm ~/.npmrc

# 重新安装
npm install @srdcloud/gemini-cli --registry=https://registry.npmjs.org/
```

## 验证安装

安装成功后，验证包是否正确安装：

```bash
# 查看安装的包
npm list @srdcloud/gemini-cli

# 查看package.json中的依赖
npm ls

# 测试包是否可用
npx gemini --version
```

## 恢复npm配置

如果您需要同时使用公网和私有registry：

```bash
# 恢复原来的registry配置
npm config set registry https://gz01-srdart.srdcloud.cn/npm/srdcloud/srdcloud-release-npm-virtual/

# 为特定scope配置不同的registry
npm config set @srdcloud:registry https://registry.npmjs.org/
```

## 问题排查

如果仍然遇到问题，请尝试：

1. **检查npm版本**

   ```bash
   npm --version  # 应该是 10.x 或更高
   ```

2. **检查Node版本**

   ```bash
   node --version  # 应该是 18.x 或更高
   ```

3. **查看安装日志**

   ```bash
   npm install @srdcloud/gemini-cli --verbose 2>&1 | tail -100
   ```

4. **尝试全新安装**
   ```bash
   mkdir /tmp/test-install && cd /tmp/test-install
   npm install @srdcloud/gemini-cli --registry=https://registry.npmjs.org/
   ```

## 包信息

- **包名**: @srdcloud/gemini-cli
- **registry**: https://registry.npmjs.org/
- **所需Node版本**: >= 20.0.0
- **最新版本**: 0.13.0-nightly.20251118.b87626c
