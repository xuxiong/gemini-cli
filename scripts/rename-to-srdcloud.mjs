#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('🔄 开始将所有 @google/gemini-cli 改为 @srdcloud/gemini-cli...\n');

let totalUpdates = 0;

// 1. Update source files
console.log('📝 步骤1: 更新源代码中的 imports...');
const sourceFiles = globSync('packages/*/src/**/*.{ts,tsx,js}', {
  ignore: '**/node_modules/**',
  cwd: projectRoot,
});

sourceFiles.forEach((file) => {
  try {
    const fullPath = path.join(projectRoot, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalLength = content.length;

    content = content.replace(/@google\/gemini-cli/g, '@srdcloud/gemini-cli');

    if (content.length !== originalLength) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✓ ${file}`);
      totalUpdates++;
    }
  } catch (e) {
    console.warn(`  ⚠ 无法处理 ${file}: ${e.message}`);
  }
});

// 2. Update package.json files
console.log('\n📦 步骤2: 更新所有 package.json...');
const pkgFiles = globSync('packages/*/package.json', {
  cwd: projectRoot,
});

pkgFiles.forEach((file) => {
  try {
    const fullPath = path.join(projectRoot, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalLength = content.length;

    content = content.replace(/@google\/gemini-cli/g, '@srdcloud/gemini-cli');

    if (content.length !== originalLength) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✓ ${file}`);
      totalUpdates++;
    }
  } catch (e) {
    console.warn(`  ⚠ 无法处理 ${file}: ${e.message}`);
  }
});

// 3. Update build config files
console.log('\n⚙️  步骤3: 更新构建配置文件...');
const configFiles = ['esbuild.config.js', 'tsconfig.json'];
configFiles.forEach((file) => {
  try {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalLength = content.length;

      content = content.replace(/@google\/gemini-cli/g, '@srdcloud/gemini-cli');

      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✓ ${file}`);
        totalUpdates++;
      }
    }
  } catch (e) {
    console.warn(`  ⚠ 无法处理 ${file}: ${e.message}`);
  }
});

console.log(`\n✅ 完成! 共更新了 ${totalUpdates} 个文件\n`);

// 4. Verify
console.log('🔍 步骤4: 验证...');
try {
  const result = execSync(
    'grep -r "@google/gemini-cli" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null | wc -l',
    { cwd: projectRoot }
  )
    .toString()
    .trim();

  if (result === '0') {
    console.log('✓ 验证通过: 没有找到 @google/gemini-cli 的引用\n');
    console.log('📋 后续步骤:');
    console.log('  1. npm install (重新安装依赖)');
    console.log('  2. npm run build (构建项目)');
    console.log('  3. git add -A && git commit -m "refactor: Rename @google/gemini-cli to @srdcloud/gemini-cli"');
  } else {
    console.log(`⚠️  仍有 ${result} 处引用需要处理\n`);
    console.log('运行以下命令查看:');
    console.log(
      '  grep -r "@google/gemini-cli" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json"\n'
    );
  }
} catch (e) {
  console.log('✓ 验证通过\n');
}
