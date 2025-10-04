# 🚀 Quick Start - You're Almost There!

## ✅ What's Already Done

- ✅ Node.js v22.20.0 is installed
- ✅ npm 10.9.3 is installed
- ✅ Project dependencies are installed (445 packages)
- ✅ All source code is ready

## ⚠️ Current Issue

Node.js works in regular Command Prompt but not in VS Code's integrated terminal. This is a common Windows/VS Code PATH issue.

## 🔧 Solution - Choose ONE:

### Option 1: Quick Fix (For Right Now)

**In your VS Code terminal, run:**

```powershell
. .\setup-path.ps1
```

This adds Node.js to your PATH for the current terminal session. You'll see:
```
✅ Node.js has been added to PATH
Node version: v22.20.0
npm version: 10.9.3
```

Then you can run:
```powershell
npm run dev
```

**Note:** You'll need to run `. .\setup-path.ps1` every time you open a new terminal in VS Code.

### Option 2: Permanent Fix (Recommended)

1. **Close VS Code completely** (all windows)
2. **Reopen VS Code**
3. **Open terminal** and try:
   ```powershell
   node --version
   ```

If it works, great! If not, continue to Option 3.

### Option 3: PowerShell Profile (Most Reliable)

Make Node.js available in all PowerShell sessions:

1. **In VS Code terminal, run:**
   ```powershell
   if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }
   notepad $PROFILE
   ```

2. **In Notepad, add this line:**
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"
   ```

3. **Save and close Notepad**

4. **In VS Code, run:**
   ```powershell
   . $PROFILE
   ```

5. **Test it:**
   ```powershell
   node --version
   ```

Now Node.js will work in all future PowerShell sessions!

## 🎯 Next Steps - Run Your App!

Once Node.js is working in your terminal (using any of the options above):

### 1. Start Development Mode

```powershell
npm run dev
```

This will:
- Start the Vite development server
- Compile the Electron app
- Open your Budget Manager application
- Enable hot-reload for quick development

### 2. Use the Application

When the app opens:

1. **Go to Admin tab**
   - Add countries (USA, UK, etc.)
   - Add currencies (USD, EUR, GBP)
   - Create asset types (Checking, Savings)
   - Set up categories (Salary, Rent, Groceries)
   - Create accounts

2. **Go to Budgeting tab**
   - Add income and expenses
   - Track money exchanges

3. **Go to Analytics tab**
   - See your financial charts
   - Analyze spending by category

### 3. Optional: Load Sample Data

To quickly test the app:

1. **Open the app** (npm run dev)
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Copy and paste the content of** `seed-data.js`
5. **Run:** `seedDatabase()`

This creates sample data for testing.

## 📝 Current Session

For your current VS Code terminal session, I've already added Node.js to the PATH temporarily. You can now run:

```powershell
npm run dev
```

But remember: when you open a new terminal, you'll need to either:
- Run `. .\setup-path.ps1` again, OR
- Apply one of the permanent fixes above

## 🎨 Building for Production

When you're ready to create an installer:

```powershell
# Build the application
npm run build

# Create Windows installer (will be in release/ folder)
npm run package:win
```

## 📚 Documentation Files

- `README.md` - Complete feature documentation
- `QUICKSTART.md` - Getting started guide (updated)
- `VSCODE_NODE_FIX.md` - Detailed VS Code/Node.js PATH solutions
- `TROUBLESHOOTING.md` - Common issues and fixes
- `PROJECT_SUMMARY.md` - Overview of what's been built
- `TECHNICAL.md` - Architecture and technical details

## 🆘 If Something Goes Wrong

1. **Check TROUBLESHOOTING.md** for common issues
2. **Check VSCODE_NODE_FIX.md** for PATH-related issues
3. **Run diagnostics:**
   ```powershell
   node --version
   npm --version
   $env:PATH
   ```

## ✨ You're Ready!

Choose a fix option above, then run `npm run dev` and start managing your budget! 💰

---

**Quick reminder:** For this session right now, just run:
```powershell
. .\setup-path.ps1
npm run dev
```

And your app will start! 🚀
