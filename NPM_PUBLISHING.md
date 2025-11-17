# GitHub Actions npm Publishing Configuration

This document explains how to set up automatic publishing to npmjs.com using
GitHub Actions.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings:

1. **NPM_TOKEN**
   - Go to your npmjs.com account and create an access token:
     - Visit https://www.npmjs.com/settings/srdcloud/tokens
     - Click "Generate New Token"
     - Select the appropriate permissions (typically "Publish" for automated
       publishing)
     - Copy the generated token
   - In your GitHub repository, navigate to Settings → Secrets and variables →
     Actions
   - Add a new secret named `NPM_TOKEN` with the value of your npm token

## How the Workflow Works

The workflow defined in `.github/workflows/publish-to-npm.yml`:

1. Triggers when a new git tag is pushed (e.g., `v1.0.0`) or manually via
   workflow_dispatch
2. Checks out the code
3. Sets up Node.js environment
4. Builds the packages
5. Modifies the package name from `@google/gemini-cli` to `@srdcloud/gemini-cli`
6. Publishes the package to npmjs.com with the specified tag (defaults to
   'latest')

## Important Notes

- The original project is published under the `@google` scope. This workflow
  creates a copy of the package with the `@srdcloud` scope to publish under your
  npm organization.
- Make sure to update the package name in the workflow file if you choose a
  different scope.
- To publish a new version, simply create and push a git tag (e.g.,
  `git tag v1.0.1 && git push origin v1.0.1`)
- The workflow includes npm provenance generation for security verification

## Publishing Process

For each release:

1. Update the version in package.json (or use npm version commands)
2. Commit the changes
3. Create a git tag: `git tag v1.x.y`
4. Push the tag: `git push origin v1.x.y`
5. GitHub Actions will automatically trigger the publish workflow

## Troubleshooting

If publishing fails:

1. Verify that your NPM_TOKEN secret is correctly set in GitHub repository
   settings
2. Check that the token has the correct permissions for publishing
3. Ensure the package name doesn't conflict with existing packages
4. View the workflow logs for specific error details
