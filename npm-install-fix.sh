#!/bin/bash

echo "🔧 修复npm安装问题"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 第1步: 清理npm缓存
echo "📦 步骤1: 清理npm缓存..."
npm cache clean --force
echo "✅ npm缓存已清理"
echo ""

# 第2步: 删除旧的lockfile和node_modules
echo "📦 步骤2: 删除旧的lockfile和node_modules..."
rm -rf package-lock.json node_modules
echo "✅ 已删除旧的文件"
echo ""

# 第3步: 重置npm registry配置到默认值
echo "📦 步骤3: 配置npm registry为npmjs.org..."
npm config set registry https://registry.npmjs.org/
echo "✅ registry已配置"
echo ""

# 第4步: 安装包
echo "📦 步骤4: 安装@srdcloud/gemini-cli..."
npm install @srdcloud/gemini-cli --no-save
echo ""

if [ $? -eq 0 ]; then
  echo "✅ 安装成功！"
  echo ""
  echo "📋 已安装的包:"
  npm list --depth=0
else
  echo "❌ 安装失败。请尝试以下操作:"
  echo "  1. npm install -g npm@latest  (升级npm)"
  echo "  2. rm -rf ~/.npm"
  echo "  3. 重新运行本脚本"
fi
