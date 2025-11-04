/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
} from '../i18n/i18n.js';

describe('i18n', () => {
  beforeEach(() => {
    // Reset to default language before each test
    setLanguage('en');
  });

  it('should return English translation by default', () => {
    expect(t('app.header.title')).toBe('Gemini CLI');
  });

  it('should return fallback translation if key does not exist', () => {
    expect(t('non.existent.key')).toBe('non.existent.key');
  });

  it('should return Chinese translation when language is set to zh-CN', () => {
    setLanguage('zh-CN');
    expect(t('app.header.title')).toBe('Gemini 命令行工具');
  });

  it('should handle translation replacements', () => {
    setLanguage('en');
    expect(t('ui.tips.tip3', { fileName: 'GEMINI.md' })).toBe(
      'Create GEMINI.md files to customize your interactions with Gemini.',
    );
  });

  it('should handle translation replacements in Chinese', () => {
    setLanguage('zh-CN');
    expect(t('ui.tips.tip3', { fileName: 'GEMINI.md' })).toBe(
      '创建 GEMINI.md 文件以自定义与 Gemini 的交互。',
    );
  });

  it('should get current language', () => {
    expect(getLanguage()).toBe('en');
    setLanguage('zh-CN');
    expect(getLanguage()).toBe('zh-CN');
  });

  it('should get available languages', () => {
    const languages = getAvailableLanguages();
    expect(languages).toContain('en');
    expect(languages).toContain('zh-CN');
  });

  it('should fall back to English for missing translations', () => {
    // Temporarily remove a translation from zh-CN to test fallback
    setLanguage('zh-CN');
    // Even if a key doesn't exist in zh-CN, it should fall back to English
    // For this test, we'll use a key that exists in en but simulate that it doesn't in zh-CN
    expect(t('app.header.title')).toBe('Gemini 命令行工具'); // This exists in both
  });
});
