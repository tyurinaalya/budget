# Troubleshooting Checklist

## Before You Start

- [ ] **Node.js installed?**
  - Check: Open terminal and run `node --version`
  - Should show: v18.x.x or higher
  - If not: Download from https://nodejs.org/

- [ ] **npm installed?**
  - Check: Run `npm --version`
  - Should show: 9.x.x or higher
  - If not: Reinstall Node.js (npm comes with it)

## Installation Issues

### "npm is not recognized"

**Problem**: Command not found error when running `npm`

**Solutions**:
1. [ ] Close and reopen your terminal
2. [ ] Restart your computer (to refresh PATH)
3. [ ] Reinstall Node.js from https://nodejs.org/
4. [ ] Add Node.js to PATH manually:
   - Windows: Add `C:\Program Files\nodejs\` to System PATH
   - macOS: Should be automatic with installer

### "Cannot find module" errors

**Problem**: TypeScript or JavaScript modules not found

**Solutions**:
1. [ ] Delete `node_modules` folder
2. [ ] Delete `package-lock.json` file
3. [ ] Run `npm install` again
4. [ ] Wait for installation to complete (may take 5-10 minutes)

### "Permission denied" errors

**Problem**: Cannot write to directories

**Solutions**:

**Windows**:
1. [ ] Run PowerShell/Terminal as Administrator
2. [ ] Or change folder permissions in Properties

**macOS/Linux**:
1. [ ] Run with sudo: `sudo npm install`
2. [ ] Or fix npm permissions: 
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

## Build Issues

### "TypeScript error" during build

**Problem**: Type errors in code

**Solutions**:
1. [ ] Run `npm install` to ensure types are installed
2. [ ] Check that these packages are installed:
   - `@types/node`
   - `@types/react`
   - `@types/react-dom`
   - `@types/better-sqlite3`
3. [ ] Restart your IDE/editor
4. [ ] Delete `.vscode` folder and restart

### "Vite build failed"

**Problem**: Frontend build errors

**Solutions**:
1. [ ] Delete `dist` folder
2. [ ] Run `npm run build:renderer` separately
3. [ ] Check for syntax errors in React files
4. [ ] Ensure all imports are correct

### "Electron build failed"

**Problem**: Backend build errors

**Solutions**:
1. [ ] Run `npm run build:electron` separately
2. [ ] Check `electron/` folder for TypeScript errors
3. [ ] Ensure `tsconfig.electron.json` is correct

## Runtime Issues

### Application won't start

**Problem**: App doesn't launch or crashes immediately

**Solutions**:
1. [ ] Build first: `npm run build`
2. [ ] Try dev mode: `npm run dev`
3. [ ] Check terminal for error messages
4. [ ] Delete `dist` folder and rebuild
5. [ ] Check Developer Tools (F12) for errors

### "Cannot connect to database"

**Problem**: Database initialization fails

**Solutions**:
1. [ ] Check file permissions on user data directory
2. [ ] Delete `.key` and `budget.db` files (will reset app)
3. [ ] Ensure SQLite is installed (comes with better-sqlite3)
4. [ ] Check disk space

### White/blank screen

**Problem**: UI doesn't load

**Solutions**:
1. [ ] Open Developer Tools: Press F12 (or Cmd+Option+I on Mac)
2. [ ] Check Console tab for JavaScript errors
3. [ ] Verify `dist/renderer` folder exists
4. [ ] Run `npm run build:renderer` again
5. [ ] Check that `index.html` loads correctly

### Data not saving

**Problem**: Changes don't persist

**Solutions**:
1. [ ] Check Console for errors (F12)
2. [ ] Verify `.key` file exists in user data folder
3. [ ] Check database file permissions
4. [ ] Look for "UNIQUE constraint" errors (duplicate entries)
5. [ ] Check that accounts/categories exist before adding transactions

## Development Issues

### Hot reload not working

**Problem**: Changes don't appear automatically in dev mode

**Solutions**:
1. [ ] Restart dev server: Stop and run `npm run dev` again
2. [ ] Check that port 5173 is not in use
3. [ ] Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. [ ] Check Vite config in `vite.config.ts`

### "Port already in use"

**Problem**: Cannot start dev server

**Solutions**:
1. [ ] Kill process using port 5173:
   - Windows: `netstat -ano | findstr :5173` then `taskkill /PID <PID> /F`
   - macOS: `lsof -ti:5173 | xargs kill -9`
2. [ ] Change port in `vite.config.ts`
3. [ ] Restart your computer

## Packaging Issues

### "electron-builder failed"

**Problem**: Cannot create installer

**Solutions**:
1. [ ] Ensure you ran `npm run build` first
2. [ ] Check `dist` folder exists with all files
3. [ ] Verify `package.json` build config is correct
4. [ ] Try packaging for one platform at a time:
   - `npm run package:win` OR
   - `npm run package:mac`
5. [ ] Check disk space (need ~500MB free)

### Icons not showing

**Problem**: App icon is default Electron icon

**Solutions**:
1. [ ] Create `assets/` folder
2. [ ] Add `icon.ico` (Windows) and `icon.icns` (macOS)
3. [ ] Update paths in `package.json` build config
4. [ ] Rebuild application

### Large installer size

**Problem**: Installer is too big (>200MB)

**Explanation**: This is normal! Electron bundles Chrome and Node.js
- Windows installer: ~150-200MB
- macOS DMG: ~180-220MB

**Solutions** (to reduce size):
1. [ ] Enable `asar` packing in build config
2. [ ] Remove unused dependencies
3. [ ] Use `electron-builder` options for compression

## Data Issues

### Cannot delete items

**Problem**: "Item is in use" error

**Explanation**: Foreign key constraints prevent deletion

**Solutions**:
1. [ ] Delete dependent items first:
   - Delete transactions before accounts
   - Delete accounts before currencies/countries
   - Delete exchanges before accounts
2. [ ] Or modify database to allow cascading deletes

### Incorrect balances

**Problem**: Account balances don't match transactions

**Solutions**:
1. [ ] Don't manually edit account balances after transactions
2. [ ] Use transactions to update balances
3. [ ] Delete and recreate account if corrupted
4. [ ] Check that transactions are being saved correctly

### Missing data after update

**Problem**: Data disappeared after updating transaction

**Explanation**: Transaction update reverts old balance first

**Solutions**:
1. [ ] This is normal behavior
2. [ ] Balances are recalculated automatically
3. [ ] Check that transaction was saved correctly

## Platform-Specific Issues

### Windows

**Problem**: "Windows Defender" blocks installation

**Solution**:
1. [ ] This is normal for unsigned apps
2. [ ] Click "More info" → "Run anyway"
3. [ ] Or sign the app with a code signing certificate

**Problem**: "SmartScreen" warning

**Solution**:
1. [ ] Click "More info" → "Run anyway"
2. [ ] Normal for apps without publisher certificate

### macOS

**Problem**: "App is damaged" message

**Solution**:
1. [ ] Remove quarantine attribute:
   ```bash
   xattr -cr /Applications/Budget\ Manager.app
   ```
2. [ ] Or right-click → Open (first time only)

**Problem**: "Unidentified developer"

**Solution**:
1. [ ] Go to System Preferences → Security & Privacy
2. [ ] Click "Open Anyway"
3. [ ] Or sign the app with Apple Developer certificate

## Performance Issues

### Slow startup

**Problem**: App takes long to start

**Solutions**:
1. [ ] Normal on first run (generating encryption key)
2. [ ] Subsequent runs should be faster
3. [ ] Check for large database (>100MB)
4. [ ] Consider archiving old transactions

### Slow transactions list

**Problem**: UI freezes with many transactions

**Solutions**:
1. [ ] Use date filters to limit results
2. [ ] Add pagination (future enhancement)
3. [ ] Archive old transactions
4. [ ] Check for slow queries in console

## Getting More Help

If none of these solutions work:

1. [ ] Check the error message carefully
2. [ ] Look in Developer Tools Console (F12)
3. [ ] Check the terminal output
4. [ ] Review README.md for detailed documentation
5. [ ] Check Node.js and npm versions are correct
6. [ ] Try on a different computer to isolate issue
7. [ ] Search for error message online
8. [ ] Check GitHub issues (if using version control)

## Quick Reset

**Nuclear option**: Start completely fresh

1. [ ] Delete `node_modules` folder
2. [ ] Delete `dist` folder
3. [ ] Delete `package-lock.json`
4. [ ] Run `npm install`
5. [ ] Run `npm run build`
6. [ ] Try running the app

## Logs Location

Check logs for more information:

**Windows**: 
- `%APPDATA%\budget-app\logs\`

**macOS**: 
- `~/Library/Logs/budget-app/`

**Or check Console** (F12 in app):
- Look for red error messages
- Check Network tab for failed requests
- Check Application tab for storage issues

## Common Error Messages

### "SQLITE_CONSTRAINT: UNIQUE"
- **Meaning**: Trying to add duplicate entry
- **Solution**: Check if item already exists

### "SQLITE_CONSTRAINT: FOREIGN KEY"
- **Meaning**: Referenced item doesn't exist
- **Solution**: Create parent item first (e.g., currency before account)

### "Cannot read property 'id' of undefined"
- **Meaning**: Data not loaded yet
- **Solution**: Wait for data to load, check network/IPC

### "Module not found"
- **Meaning**: Dependency missing
- **Solution**: Run `npm install`

### "Permission denied"
- **Meaning**: Cannot access file/folder
- **Solution**: Check permissions, run as admin

## Checklist Summary

Before asking for help, verify:

1. [ ] Node.js 18+ installed
2. [ ] npm installed
3. [ ] `npm install` completed successfully
4. [ ] No errors in terminal
5. [ ] No errors in Developer Tools (F12)
6. [ ] Tried restarting the app
7. [ ] Tried rebuilding (`npm run build`)
8. [ ] Checked this troubleshooting guide
9. [ ] Reviewed error messages carefully
10. [ ] Have error messages/screenshots ready

Good luck! 🍀
