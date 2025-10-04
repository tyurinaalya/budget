# Budget App - macOS Setup Guide

## Prerequisites

### 1. Install Homebrew (if not already installed)
Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (v18 or higher)
```bash
# Using Homebrew
brew install node

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

Alternative: Download from [nodejs.org](https://nodejs.org/)

### 3. Install Python (required for native modules)
```bash
# Python is usually pre-installed on macOS
python3 --version

# If not installed:
brew install python3
```

### 4. Install Xcode Command Line Tools (required for building native modules)
```bash
xcode-select --install
```

This will open a dialog - click "Install" and follow the prompts.

## Installation Steps

### 1. Clone or Download the Repository
```bash
cd ~/Documents  # or your preferred location
# If you have the code, navigate to it
cd budget
```

### 2. Install Dependencies
```bash
npm install
```

**Note:** This may take a few minutes as it needs to compile native modules (better-sqlite3) for macOS.

If you encounter errors during `npm install`, try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 3. Build Native Modules (if needed)
If you get errors about native modules:
```bash
npm run rebuild
```

Or manually:
```bash
npx electron-rebuild
```

## Running the App

### Development Mode (with hot-reload)
```bash
npm run dev
```

This will:
- Start the Vite development server on http://localhost:5173
- Compile TypeScript files
- Launch the Electron app
- Enable hot-reload for React components

**First Run:** The app will create:
- `budget.db` - Your encrypted database
- `.key` - Your encryption key (keep this safe!)

These files are stored in:
```
~/Library/Application Support/budget-app/
```

### Stop the App
- Click the red close button (⌘ + Q)
- Or press `Ctrl + C` in the terminal

## Building for Production

### Build the App
```bash
npm run build
```

### Package for macOS
```bash
npm run package:mac
```

This will create a `.dmg` installer in the `release/` directory.

The packaged app includes:
- Universal binary (Intel + Apple Silicon M1/M2/M3)
- Signed and notarized (if configured)
- Ready to distribute

### Install the Built App
1. Open `release/Budget App-1.0.0.dmg`
2. Drag "Budget App" to Applications folder
3. Launch from Applications or Spotlight

**Security Note (First Launch):**
If you see "Budget App cannot be opened because it is from an unidentified developer":
1. Go to **System Settings → Privacy & Security**
2. Click "Open Anyway" next to the Budget App message
3. Or right-click the app → Open → Open

## Troubleshooting

### Error: "better-sqlite3" module not found
```bash
npm run rebuild
# or
npx electron-rebuild -f -w better-sqlite3
```

### Error: "node-gyp" build failed
Make sure Xcode Command Line Tools are installed:
```bash
xcode-select --install
```

### Error: Permission denied
```bash
# Fix npm permissions
sudo chown -R $USER:$(id -gn $USER) ~/.config
sudo chown -R $USER:$(id -gn $USER) ~/.npm
```

### App won't start after building
Check if native modules are properly rebuilt:
```bash
# Rebuild for Electron
./node_modules/.bin/electron-rebuild
```

### Database location
The app stores data in:
```bash
~/Library/Application Support/budget-app/
```

To backup your data:
```bash
# Create backup
cp -r ~/Library/Application\ Support/budget-app ~/Documents/budget-backup-$(date +%Y%m%d)

# View files
open ~/Library/Application\ Support/budget-app/
```

### Reset the App
If you need to start fresh:
```bash
# ⚠️ WARNING: This deletes all your data!
rm -rf ~/Library/Application\ Support/budget-app/
```

## Apple Silicon (M1/M2/M3) Notes

The app works natively on Apple Silicon Macs. During `npm install`, native modules are automatically compiled for ARM64.

If you encounter issues:
```bash
# For ARM64 (Apple Silicon)
arch -arm64 npm install

# For x86_64 (Intel emulation via Rosetta)
arch -x86_64 npm install
```

## Development Tips

### Open DevTools
In development mode, press:
- **⌘ + Option + I** (Cmd + Alt + I)
- Or add to `electron/main.ts`:
  ```typescript
  mainWindow.webContents.openDevTools();
  ```

### View Console Logs
- **Frontend logs:** DevTools Console
- **Backend logs:** Terminal where you ran `npm run dev`

### Hot Reload
- React components reload automatically
- For Electron main process changes, restart the app (Ctrl+C then `npm run dev`)

### VSCode on macOS
Recommended extensions:
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

## System Requirements

- **macOS:** 10.13 (High Sierra) or higher
- **Processor:** Intel or Apple Silicon (M1/M2/M3)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 500 MB for app + your data
- **Node.js:** 18.x or higher
- **Python:** 3.x (for native module compilation)

## File Structure on macOS

```
~/Library/Application Support/budget-app/
├── budget.db          # Encrypted SQLite database
├── .key              # AES-256 encryption key (DO NOT SHARE!)
└── logs/             # Application logs (if enabled)
```

**Important:** 
- Backup the `.key` file - without it, you cannot decrypt your database
- The `budget.db` file is encrypted with AES-256-CBC
- Keep both files safe and private

## Quick Reference

```bash
# Install dependencies
npm install

# Run development mode
npm run dev

# Build for production
npm run build

# Package for macOS
npm run package:mac

# Rebuild native modules
npm run rebuild

# View database location
open ~/Library/Application\ Support/budget-app/

# Backup data
cp -r ~/Library/Application\ Support/budget-app ~/Documents/budget-backup
```

## Getting Help

If you encounter issues:
1. Check the error message in Terminal
2. Try rebuilding native modules: `npm run rebuild`
3. Clear and reinstall: `rm -rf node_modules && npm install`
4. Check Node.js version: `node --version` (must be 18+)
5. Verify Xcode tools: `xcode-select -p`

## Next Steps

After installation:
1. Launch the app: `npm run dev`
2. Set up your data (Admin Panel):
   - Add Countries
   - Add Currencies
   - Add Asset Types
   - Create Accounts
   - Add Categories
3. Start tracking your budget!

See `QUICKSTART.md` for a detailed usage guide.
