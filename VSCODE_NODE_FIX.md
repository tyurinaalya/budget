# VS Code Terminal - Node.js PATH Fix

## Problem

Node.js works in regular Command Prompt/PowerShell but not in VS Code's integrated terminal.

## Quick Fix (Temporary - This Session Only)

Run this in your VS Code PowerShell terminal:

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
```

Then verify:
```powershell
node --version
npm --version
```

## Permanent Fix

Choose ONE of these options:

### Option 1: Restart VS Code (Simplest)

1. Close VS Code completely
2. Reopen VS Code
3. Try `node --version` again

This works because Windows should have Node.js in the system PATH, but VS Code hadn't picked it up yet.

### Option 2: Add to PowerShell Profile (Recommended)

If restarting doesn't work, add Node.js to your PowerShell profile:

1. Open PowerShell profile:
```powershell
notepad $PROFILE
```

2. If file doesn't exist, create it:
```powershell
New-Item -Path $PROFILE -Type File -Force
notepad $PROFILE
```

3. Add this line to the file:
```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
```

4. Save and close Notepad

5. Reload the profile:
```powershell
. $PROFILE
```

### Option 3: System Environment Variables (Most Permanent)

1. Press `Win + X`, select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables" or "System variables", find `Path`
5. Click "Edit"
6. Check if `C:\Program Files\nodejs\` is in the list
7. If not, click "New" and add: `C:\Program Files\nodejs`
8. Click OK on all dialogs
9. Restart VS Code

## Verify Fix

After applying any fix, test:

```powershell
node --version
npm --version
```

Both should show version numbers.

## Already Fixed for This Session

I've already run the temporary fix command for you, so Node.js should work in your current VS Code terminal session. However, you'll need to apply one of the permanent fixes above so it works when you restart VS Code.

## Now You Can Use npm

With Node.js working, you can now use all npm commands:

```bash
npm install          # Install dependencies (already done!)
npm run dev          # Start development mode
npm run build        # Build for production
npm run package:win  # Create Windows installer
```

## Troubleshooting

If node still doesn't work after trying all fixes:

1. **Check Node.js installation location**:
   ```powershell
   Get-ChildItem "C:\Program Files\nodejs\"
   ```

2. **Try running with full path**:
   ```powershell
   & "C:\Program Files\nodejs\node.exe" --version
   ```

3. **Check if it's in a different location**:
   - Check `C:\Program Files (x86)\nodejs\`
   - Check `%LOCALAPPDATA%\Programs\nodejs\`
   - Check `%APPDATA%\npm\`

4. **Reinstall Node.js**:
   - Download from https://nodejs.org/
   - Make sure to check "Add to PATH" during installation
   - Restart computer after installation
