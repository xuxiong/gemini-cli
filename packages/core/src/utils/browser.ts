/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Determines if we should attempt to launch a browser for authentication
 * based on the user's environment.
 *
 * This is an adaptation of the logic from the Google Cloud SDK.
 * @returns True if the tool should attempt to launch a browser.
 */
export function shouldAttemptBrowserLaunch(): boolean {
  // Environment variable to force disable browser launch
  if (process.env['NO_BROWSER']) {
    return false;
  }

  // A list of browser names that indicate we should not attempt to open a
  // web browser for the user.
  const browserBlocklist = ['www-browser'];
  const browserEnv = process.env['BROWSER'];
  if (browserEnv && browserBlocklist.includes(browserEnv)) {
    return false;
  }
  // Common environment variables used in CI/CD or other non-interactive shells.
  if (
    process.env['CI'] ||
    process.env['DEBIAN_FRONTEND'] === 'noninteractive'
  ) {
    return false;
  }

  // The presence of SSH_CONNECTION indicates a remote session.
  // We should not attempt to launch a browser unless a display is explicitly available
  // (checked below for Linux).
  const isSSH = !!process.env['SSH_CONNECTION'];

  // On Linux, if we're in an SSH session without a display, we should avoid launching browser
  // But if we're not in SSH, we can attempt to launch a browser (the open library will handle
  // different systems appropriately)
  if (process.platform === 'linux' && isSSH) {
    const displayVariables = ['DISPLAY', 'WAYLAND_DISPLAY', 'MIR_SOCKET'];
    const hasDisplay = displayVariables.some((v) => !!process.env[v]);
    if (!hasDisplay) {
      return false;
    }
  }

  // If in an SSH session on a non-Linux OS (e.g., macOS) without display, don't launch browser.
  if (isSSH && process.platform !== 'linux') {
    return false;
  }

  // For other cases, we generally assume it's safe to attempt to launch a browser
  // The `open` command's error handling will catch final edge cases.
  return true;
}
