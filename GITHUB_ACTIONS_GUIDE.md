# GitHub Actions Automated Builds Guide

## Overview

This project uses GitHub Actions to automatically build installers for **both Windows and macOS** whenever you push a version tag. No need to manually build on each platform!

## How It Works

1. **You push a version tag** → GitHub Actions automatically triggers
2. **Two build jobs run in parallel**:
   - macOS job builds `.dmg` installer on `macos-latest`
   - Windows job builds `.exe` installer on `windows-latest`
3. **Installers are uploaded as artifacts** → You can download them from the Actions tab
4. **A GitHub Release is created** → Both installers are attached automatically

## Prerequisites

### 1. Push Your Code to GitHub

If you haven't already:

```powershell
# Initialize git repository (if not done)
git init

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/budget.git

# Add all files
git add .

# Commit
git commit -m "Initial commit with GitHub Actions"

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Actions

- Go to your repository on GitHub
- Click **Settings** → **Actions** → **General**
- Under "Workflow permissions", select **"Read and write permissions"**
- Click **Save**

## Usage

### Creating a Release

1. **Update version in package.json**:
   ```json
   {
     "version": "1.10.0"
   }
   ```

2. **Commit the version change**:
   ```powershell
   git add package.json
   git commit -m "Bump version to 1.10.0"
   git push
   ```

3. **Create and push a version tag**:
   ```powershell
   # Create tag (use 'v' prefix)
   git tag v1.10.0
   
   # Push the tag to GitHub
   git push origin v1.10.0
   ```

4. **Watch the magic happen!**
   - Go to your repository on GitHub
   - Click the **Actions** tab
   - You'll see the "Build and Release" workflow running
   - Wait 5-10 minutes for both builds to complete

5. **Download or share installers**:
   - Go to the **Releases** tab
   - Your new release (v1.10.0) will be there
   - Both `Budget-App-1.10.0.dmg` and `Budget-App-Setup-1.10.0.exe` will be attached
   - Share the download links with users!

## What Gets Built

### macOS Build
- **File**: `Budget-App-{version}.dmg`
- **Platform**: Intel and Apple Silicon (Universal)
- **Size**: ~100-150 MB
- **Runs on**: macOS 10.13 (High Sierra) and newer

### Windows Build
- **File**: `Budget-App-Setup-{version}.exe`
- **Platform**: x64
- **Size**: ~100-150 MB
- **Runs on**: Windows 10 and newer

## Workflow File Explanation

The workflow is defined in `.github/workflows/build.yml`:

```yaml
on:
  push:
    tags:
      - 'v*'  # Triggers on v1.0.0, v1.10.0, etc.
```

**Trigger**: Only runs when you push a tag starting with `v`

```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest]
```

**Parallel builds**: Runs on both macOS and Windows simultaneously

```yaml
- name: Install dependencies
  run: npm ci
```

**npm ci**: Faster and more reliable than `npm install` for CI/CD

```yaml
- name: Build for macOS
  if: matrix.os == 'macos-latest'
  run: npm run build && npm run package:mac
```

**Conditional execution**: Only builds macOS package on macOS runner

```yaml
- name: Create GitHub Release
  uses: softprops/action-gh-release@v1
```

**Automatic release**: Creates a GitHub Release with both installers attached

## Monitoring Builds

### Check Build Status

1. Go to **Actions** tab on GitHub
2. Click on the workflow run
3. See both "macOS" and "Windows" jobs
4. Click each job to see detailed logs

### If a Build Fails

**Common issues**:

1. **Native module compilation fails**:
   - Check the logs for `better-sqlite3` errors
   - Usually auto-fixed by `electron-rebuild` in the workflow

2. **Node version mismatch**:
   - Workflow uses Node.js 18 (specified in setup-node)
   - Change version in workflow if needed

3. **Package.json scripts missing**:
   - Make sure `package:mac` and `package:win` scripts exist
   - Currently defined in your package.json ✓

4. **Permissions error**:
   - Check GitHub Actions permissions in Settings
   - Should have "Read and write permissions"

## Downloading Build Artifacts

Even without creating a release, you can download the installers:

1. Go to **Actions** tab
2. Click on a completed workflow run
3. Scroll down to **Artifacts** section
4. Download:
   - `macos-dmg` → Contains the .dmg file
   - `windows-installer` → Contains the .exe file

Artifacts are kept for 90 days by default.

## Cost

**GitHub Actions is FREE for public repositories!**

For private repositories:
- Free tier: 2,000 minutes/month
- Each build takes ~5-10 minutes
- macOS builds count as 10x minutes (50-100 minutes charged)
- Windows builds count as 1x minutes (5-10 minutes charged)
- Total per release: ~60-110 minutes

**Tip**: Keep repository public for unlimited free builds.

## Advanced Configuration

### Building on Every Commit

To build on every push (not recommended for cost reasons):

```yaml
on:
  push:
    branches:
      - main
```

### Building Pull Requests

To test builds on PRs:

```yaml
on:
  pull_request:
    branches:
      - main
```

### Custom Build Matrix

To add Linux builds:

```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest, ubuntu-latest]
```

Then add a Linux build step:

```yaml
- name: Build for Linux
  if: matrix.os == 'ubuntu-latest'
  run: npm run build && npm run package:linux
```

### Code Signing (Advanced)

For macOS notarization and Windows code signing:

1. **macOS**:
   - Add certificates to GitHub Secrets
   - Update workflow with signing steps
   - See [electron-builder docs](https://www.electron.build/code-signing)

2. **Windows**:
   - Purchase code signing certificate
   - Add to GitHub Secrets
   - Configure in electron-builder

## Troubleshooting

### "Workflow not found" Error

**Problem**: Pushed tag but no workflow runs

**Solution**:
1. Make sure `.github/workflows/build.yml` exists
2. Push it to the `main` branch first
3. Then push the tag

```powershell
git add .github/workflows/build.yml
git commit -m "Add GitHub Actions workflow"
git push
git tag v1.10.0
git push origin v1.10.0
```

### "better-sqlite3 was compiled against a different Node.js version"

**Problem**: Native module version mismatch

**Solution**: Already handled by `npm ci` which rebuilds native modules

### "Permission denied" on Release Creation

**Problem**: GitHub token doesn't have write permissions

**Solution**:
1. Go to Settings → Actions → General
2. Select "Read and write permissions"
3. Save and re-run workflow

## Version Tagging Best Practices

Use [Semantic Versioning](https://semver.org/):

- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes

Examples:
```powershell
git tag v1.0.0   # Initial release
git tag v1.1.0   # Added manual exchange rates
git tag v1.1.1   # Fixed date formatting bug
git tag v2.0.0   # Changed database schema (breaking)
```

Always push tags:
```powershell
git push origin v1.10.0
```

Or push all tags:
```powershell
git push origin --tags
```

## Next Steps

1. ✅ **Workflow file created**: `.github/workflows/build.yml`
2. 📤 **Push to GitHub**: `git push`
3. 🏷️ **Create first tag**: `git tag v1.10.0 && git push origin v1.10.0`
4. ⏱️ **Wait 5-10 minutes**: Watch Actions tab
5. 🎉 **Download installers**: From Releases tab
6. 📧 **Share with users**: Send download links

## Questions?

- **How often can I create releases?** As often as you want! Free for public repos.
- **Can I delete old releases?** Yes, go to Releases → Edit → Delete
- **Do I need a Mac to test?** No! The workflow builds on GitHub's Mac runners
- **What if I only want to build one platform?** Remove the unwanted OS from the matrix

---

**Happy releasing! 🚀**
