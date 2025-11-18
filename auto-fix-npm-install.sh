#!/bin/bash

# npm Install Auto-Fix Script
# 用于修复npm安装@srdcloud/gemini-cli的问题

set -e

echo "════════════════════════════════════════════════════════════"
echo "  @srdcloud/gemini-cli 安装修复工具"
echo "════════════════════════════════════════════════════════════"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查npm是否存在
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ 错误: npm未安装或不在PATH中${NC}"
    echo "请从 https://nodejs.org 安装Node.js和npm"
    exit 1
fi

# 获取当前版本
NPM_VERSION=$(npm --version)
NODE_VERSION=$(node --version)

echo -e "${YELLOW}系统信息:${NC}"
echo "  Node版本: $NODE_VERSION"
echo "  npm版本: $NPM_VERSION"
echo ""

# 步骤1: 清理npm缓存
echo -e "${YELLOW}[1/5]${NC} 清理npm缓存..."
npm cache clean --force --quiet
echo -e "${GREEN}✓${NC} npm缓存已清理"
echo ""

# 步骤2: 删除旧文件
echo -e "${YELLOW}[2/5]${NC} 删除旧的lockfile和node_modules..."
rm -f package-lock.json
rm -rf node_modules
rm -rf ~/.npm
echo -e "${GREEN}✓${NC} 旧文件已删除"
echo ""

# 步骤3: 配置registry
echo -e "${YELLOW}[3/5]${NC} 配置npm registry..."
npm config set registry https://registry.npmjs.org/ --quiet
echo -e "${GREEN}✓${NC} registry已配置为: $(npm config get registry)"
echo ""

# 步骤4: 安装包
echo -e "${YELLOW}[4/5]${NC} 安装 @srdcloud/gemini-cli..."
npm install @srdcloud/gemini-cli --no-audit --no-fund

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 安装失败！${NC}"
    echo ""
    echo "尝试升级npm并重试..."
    npm install -g npm@latest
    npm cache clean --force --quiet
    echo "重新安装..."
    npm install @srdcloud/gemini-cli --no-audit --no-fund
fi

echo -e "${GREEN}✓${NC} 包已安装"
echo ""

# 步骤5: 验证
echo -e "${YELLOW}[5/5]${NC} 验证安装..."
npm list @srdcloud/gemini-cli

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ 安装成功！${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "下一步:"
    echo "  • 使用CLI: npx gemini --help"
    echo "  • 查看版本: npx gemini --version"
    echo ""
else
    echo ""
    echo -e "${RED}✗ 验证失败${NC}"
    echo "请查看上面的错误信息"
    exit 1
fi
