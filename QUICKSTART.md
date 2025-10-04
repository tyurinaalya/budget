# Quick Start Guide

## Prerequisites Installation

Before you can run this ap## First Time Setup

When you run the application for the first time:

### 1. Set Up Admin Data

Go to the **Admin** section and set up:

1. **Currencies** - Quick-add your currencies
   - Click the **⭐ star buttons** to instantly add favorites (TRY, RSD, RUB, USD, EUR, USDC, USDT)
   - Or use the dropdown to select from 168 official currencies
   - Tip: Favorites appear at the top with yellow highlighting!

2. **Countries** - Quick-add your countries
   - Click the **⭐ star buttons** for favorites (TR, RS, RU, US)
   - Or select from 240+ countries in the dropdown
   - All organized by region for easy browsing

3. **Asset Types** - Define your asset types
   - Example: Checking, Savings, Investment, Cash, Credit Card

4. **Accounts** - Create your accounts (perfect for families!)
   - Name: e.g., "John's Checking"
   - Owner: e.g., "John" (optional - great for tracking family member accounts)
   - Select Country, Currency, and Asset Type
   - Set initial balanced to install Node.js:

### 1. Install Node.js

**Download and install Node.js** from: https://nodejs.org/

- Download the **LTS (Long Term Support)** version
- For Windows: Download the `.msi` installer
- For macOS: Download the `.pkg` installer
- Run the installer and follow the prompts
- This will install both Node.js and npm (Node Package Manager)

**Verify installation** by opening a new terminal/PowerShell and running:
```bash
node --version
npm --version
```

You should see version numbers for both commands.

#### ⚠️ VS Code Terminal Issue (Windows)

If Node.js works in regular Command Prompt but NOT in VS Code terminal:

**Quick Fix - Run this in VS Code terminal:**
```powershell
. .\setup-path.ps1
```

Or manually:
```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
```

**Permanent Fix:**
1. Close VS Code completely
2. Reopen VS Code and try again

If that doesn't work, see `VSCODE_NODE_FIX.md` for detailed solutions.

### 2. Install Dependencies

Once Node.js is installed, open a terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies (may take a few minutes).

### 3. Run the Application

#### Development Mode (with hot-reload)

```bash
npm run dev
```

This will start the application in development mode where you can see changes immediately.

#### Production Build

To create a standalone application:

**For Windows:**
```bash
npm run build
npm run package:win
```

**For macOS:**
```bash
npm run build
npm run package:mac
```

The built application will be in the `release/` folder.

## First Time Setup

When you run the application for the first time:

### 1. Set Up Admin Data

Go to the **Admin** section and set up:

1. **Countries** - Add countries where you have accounts
   - Example: United States (US), United Kingdom (GB)

2. **Currencies** - Add currencies you use
   - Example: US Dollar (USD, $), Euro (EUR, €), British Pound (GBP, £)

3. **Asset Types** - Define your asset types
   - Example: Checking, Savings, Investment, Cash

4. **Accounts** - Create your accounts
   - Link each account to a country, currency, and asset type
   - Set initial balance

5. **Categories** - Set up transaction categories
   - Income categories: Salary, Freelance, Investment Returns, etc.
   - Expense categories: Groceries, Rent, Utilities, Entertainment, etc.

### 2. Start Budgeting

Go to the **Budgeting** section:

1. **Add Transactions** (Single Entry)
   - Record income and expenses one at a time
   - Select account (owner names shown for easy identification!)
   - Select category, enter amount, and date
   - Add optional descriptions
   - Account balances update automatically

2. **📊 Bulk Entry** (v1.4)
   - **Add multiple transactions at once** with Excel-like grid
   - Click "📊 Bulk Entry" tab
   - Fill rows: Date, Type, Account, Category, Amount, Description
   - **➕ Add Row** to add more transactions
   - **📋 Duplicate** button to copy similar transactions
   - Use **Tab key** for fast navigation between fields
   - Click **💾 Save All** to save everything at once
   - Perfect for: monthly bills, shopping trips, batch data entry
   - **Time saver**: Add 10+ transactions in 1-2 minutes!

3. **💰 Balance Adjustments** (NEW in v1.6!)
   - **Update balances without transactions** - perfect for investments!
   - Click "💰 Balance Adjustments" tab
   - Click "Add New" and select account
   - Enter new balance and optional reason
   - All changes are tracked in history
   - Use cases:
     - Investment gains/losses
     - Interest earned
     - Market value changes
     - Balance corrections
   - **View history** of all adjustments with before/after amounts

4. **Track Exchanges**
   - Record money transfers between accounts
   - Especially useful for currency exchanges
   - Automatically updates account balances

### 3. View Analytics

Go to the **Analytics** section:

- **Filter by Owner**: Select "All" or a specific owner to view their data
- **Accounts List**: See all accounts with current balances
- **Balance by Asset Type**: View how much money is in each asset type (Checking, Savings, etc.)
- **Balance by Country**: See your balance distribution by country
- **Balance by Currency**: View currency breakdown with pie charts
- **Expenses by Category**: Analyze spending patterns with bar charts
- Filter by date range to see trends

## Tips & Best Practices

### Quick Setup Tips
- **Use Quick-Add**: Click the ⭐ star buttons to instantly add favorite currencies/countries
- **Customize Favorites**: Edit `src/data/currencies.ts` and `src/data/countries.ts` to change favorites
- **Template Forms**: When adding custom items, use the "Load from Template" dropdown to auto-fill

### Family Budget Tips
- **Set Owners**: Add owner names to accounts (e.g., "John", "Mary", "Kids")
- **Shared Accounts**: Leave owner blank for family/shared accounts
- **Easy Identification**: Owner names appear in all dropdowns for quick selection
- **Track Everyone**: Perfect for managing multiple family members' finances in one place
- **Analytics by Owner**: Use the owner filter on Analytics page to view each person's financial summary
- **Individual Reports**: Select a specific owner to see their accounts, balances, and asset distribution

### Currency & Exchange Rate Tips (v1.3)
- **💱 Real-Time Conversion**: Total balance automatically converts to your selected currency
- **Currency Selector**: Use the dropdown in Budgeting/Analytics to choose display currency
- **Live Rates**: Exchange rates update automatically (cached for 1 hour)
- **Offline Support**: Works without internet using cached rates
- **Multi-Currency Accounts**: Track RUB, EUR, USD, TRY, BTC - all converted on demand
- **Refresh Rates**: Click "🔄 Refresh Rates" button when rates are older than 1 hour

### Cryptocurrency (BTC, ETH, etc.)
- **Already Supported**: BTC, ETH, USDC, USDT, and more are in the currency list
- **Add via Dropdown**: Select from "Add from all (168)..." in Currencies tab
- **Track Like Fiat**: Create accounts in BTC just like USD or EUR accounts
- **Asset Type**: Create "Cryptocurrency" asset type for better organization
- **Example Setup**:
  - Currency: Bitcoin (BTC)
  - Account: "Binance BTC Wallet"
  - Owner: Your name
  - Balance: 0.5 BTC
- **Conversion**: BTC balances convert to fiat (USD, EUR) using live rates

### Bulk Entry Tips (v1.4)
- **Use for Batch Entry**: Perfect when you have 5+ transactions to add
- **Duplicate Similar Items**: Fill one row, click 📋 to copy it with all values
- **Tab Navigation**: Much faster than clicking - press Tab to move between fields
- **Required Fields**: Date, Account, Category, and Amount must be filled
- **Validation**: Only complete rows are saved - incomplete rows are skipped
- **Common Uses**: Monthly bills, shopping receipts, bank statement entry

### Balance Adjustments (v1.6)
- **For Investments**: Update account balance without adding income/expense transactions
- **Track Changes**: All adjustments are saved with date, reason, and old/new balance
- **Use Cases**: Market value changes, interest earned, price corrections
- **How to Use**:
  1. Go to Budgeting page
  2. Click "💰 Balance Adjustments" tab
  3. Click "+ Add Adjustment"
  4. Select account, enter new balance, add reason
  5. History is preserved in the adjustments table

### Monthly Reports (v1.7 - NEW!)
- **Beautiful New Page**: Reports now has its own dedicated page with modern UI
- **When to Use**: After your monthly budget review (typically 5-10th of month)
- **Multi-Currency**: Shows original amounts AND converted to your chosen report currency
- **Smart Exchange Rates**: Captures rates for ALL your account currencies (even if not used in period)
- **How to Generate**:
  1. Go to "📄 Reports" page (in sidebar)
  2. Click green "Generate New Report" button
  3. Enter report name (or click "Auto-fill" based on dates)
  4. Select date range (e.g., full month)
  5. Choose report currency (e.g., USD)
  6. Click "Generate Report"
- **View Saved Reports**:
  1. Reports page shows beautiful table with all reports
  2. Click "View" to see detailed report
  3. Report displays (in order):
     - Beautiful header with report info and generation time
     - Large summary cards: Income, Expense, Net Change
     - Income by category (with original + converted amounts)
     - Expenses by category (with original + converted amounts)
     - Balance adjustments during period
     - Exchange rates section at bottom (for all account currencies)
- **Important Notes**:
  - Exchange rates show "1 [Report Currency] = X [Other Currency]"
  - To convert FROM other currency TO report currency: divide by rate
  - Generation time is displayed throughout report
  - Reports are snapshots - they don't change if exchange rates change later

### General Tips
- **Regular Updates**: Add transactions regularly for accurate tracking
- **Monthly Reviews**: Generate reports monthly to track your financial progress
- **Backup Data**: Your data is stored in:
  - Windows: `%APPDATA%/budget-app/`
  - macOS: `~/Library/Application Support/budget-app/`
  - Backup both `budget.db` and `.key` files!
  
- **Security**: Never share your `.key` file - it's needed to decrypt your data
- **Categories**: Start with a few categories and add more as needed
- **Multiple Currencies**: Add all currencies you use - the app converts them automatically
- **Report Archive**: Save important monthly reports for tax purposes or year-end reviews

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Module not found" errors
- Dependencies not installed
- Run: `npm install`

### Application won't start
- Check that you ran `npm run build` before `npm run package`
- Try deleting `node_modules` and `dist` folders, then run `npm install` again

### Data not loading
- Check file permissions in your user data directory
- Make sure `.key` file exists
- Try restarting the application

## Getting Help

If you encounter issues:
1. Check the README.md for detailed documentation
2. Ensure all prerequisites are installed
3. Try deleting `node_modules` and running `npm install` again
4. Check that you're using Node.js version 18 or higher

## Keyboard Shortcuts (Future)

Currently no keyboard shortcuts are implemented, but these could be added:
- Ctrl/Cmd + N: New transaction
- Ctrl/Cmd + F: Filter transactions
- Ctrl/Cmd + 1/2/3: Switch between sections

Enjoy managing your budget! 💰
