# 📦 Project Summary

## What You Have

I've created #### Quick-Add System
Speed up data entry with official lists:
- **168 Currencies**: Complete ISO 4217 list including crypto (BTC, ETH, USDC, USDT)
- **240+ Countries**: Official ISO 3166-1 list organized by region
- **Your Favorites**:
  - Currencies: TRY, RSD, RUB, USD, EUR, USDC, USDT
  - Countries: TR, RS, RU, US
- **One-click add**: Star buttons for instant addition
- **Visual highlighting**: Yellow background and ⭐ for favorites
- **Template filling**: Select from dropdown to auto-fill forms

### 💱 Real-Time Exchange Rates (v1.3)

#### Currency Conversion
Automatically convert all balances to your preferred currency:
- **Live Exchange Rates**: Fetches real-time rates from exchangerate-api.com
- **Smart Caching**: Rates cached for 1 hour to minimize API calls
- **Offline Support**: Uses cached rates when offline
- **Currency Selector**: Choose any currency for unified balance view

#### Features
- **Unified Balance**: See total balance from all accounts in one currency
  - Example: RUB + RSD + USD accounts all shown in USD
- **Multi-Currency Support**: Works with any currency (fiat and crypto)
- **Rate Freshness**: Shows when rates were last updated
- **Manual Refresh**: Force refresh when rates are more than 1 hour old
- **Automatic Conversion**: Happens in real-time as you switch currencies
- **Error Handling**: Falls back to cached rates if API unavailable

#### Where It Works
- **Budgeting Page**: Total Balance card with currency dropdown
- **Analytics Page**: Total Balance with currency conversion
- **All Accounts**: Seamlessly converts between any currencies

#### Technical Details
- **API**: exchangerate-api.com (free tier: 1500 requests/month)
- **Cache Duration**: 1 hour (3600 seconds)
- **Storage**: localStorage for offline access
- **Service**: `ExchangeRateService` class in `src/services/exchangeRate.ts`

### 📁 Project Structure*multiplatform budget management application** for Windows and macOS with the following features:

### ✅ Core Features Implemented

#### 1. **Admin Panel** ⚙️
Complete management interface for:
- **Countries**: Add countries from official ISO 3166-1 list with quick-add favorites (TR, RS, RU, US)
- **Currencies**: Add currencies from official ISO 4217 list with quick-add favorites (TRY, RSD, RUB, USD, EUR, USDC, USDT)
- **Accounts**: Create accounts with owner field (perfect for family budgets), linked to countries, currencies, and asset types
- **Categories**: Define income and expense categories
- **Asset Types**: Set up asset types (Checking, Savings, Investment, etc.)

**Latest Features (v1.2):**
- 👨‍👩‍👧‍👦 **Owner Field**: Track which family member owns each account
- ⭐ **Quick-Add Buttons**: One-click addition of favorite currencies and countries
- 📋 **Official Lists**: 168 currencies (ISO 4217) + 240+ countries (ISO 3166-1)
- 🎨 **Visual Indicators**: Stars and highlighting for favorite items

#### 2. **Budgeting Section** 📊
Financial transaction management:
- **Transactions**: Record income and expenses with dates, amounts, and descriptions
- **📊 Bulk Entry (v1.4)**: Add multiple transactions at once with Excel-like grid interface
  - Add/duplicate/remove rows easily
  - Tab key navigation for fast data entry
  - Smart validation - only saves complete rows
  - Perfect for batch data entry (monthly bills, shopping trips, etc.)
- **💰 Balance Adjustments (v1.6)**: Update balances without creating transactions
  - Perfect for investment gains/losses, interest, market value changes
  - Full history tracking with before/after amounts
  - Optional reason field for documentation
  - View all adjustments with dates and changes
- **Money Exchanges**: Track currency exchanges between accounts
- **Filters**: Filter by date range, account, or transaction type
- **Real-time Statistics**: View total balance, income, expenses, and net change
- **Auto-balance Updates**: Account balances automatically update with transactions

#### 3. **Analytics Dashboard** 📈
Visual insights into your finances:
- **Owner Filter (v1.5)**: View analytics for all accounts or filter by specific owner
- **Accounts List (v1.5)**: See all accounts with current balances in one table
- **Balance by Asset Type (v1.5)**: View distribution across Checking, Savings, Investment, etc.
- **Balance by Country**: See money distribution across countries (table + bar chart)
- **Balance by Currency**: View currency breakdown (table + pie chart)
- **Expenses by Category**: Analyze spending patterns (table + bar chart)
- **Date Filtering**: Customize analytics for specific time periods

### 🔐 Security Features

- **Local Storage Only**: All data stays on your computer
- **AES-256 Encryption**: Database encrypted with strong encryption
- **Automatic Key Generation**: Encryption keys generated and stored securely
- **No Network Access**: Works completely offline

### �‍👩‍👧‍👦 Family Budget Features

#### Owner Field for Accounts
Track which family member owns each account:
- **Optional field**: Add owner name (e.g., "John", "Mary", "Family")
- **Display format**: Account Name - Owner (Currency)
- **Use cases**: 
  - John's Checking - John (USD)
  - Mary's Savings - Mary (EUR)
  - Family Vacation Fund (USD)
- **Automatic migration**: Existing databases updated automatically
- **Visible everywhere**: Shows in Admin panel, Budgeting dropdowns, and transaction forms

#### Quick-Add System
Speed up data entry with official lists:
- **168 Currencies**: Complete ISO 4217 list including crypto (BTC, ETH, USDC, USDT)
- **240+ Countries**: Official ISO 3166-1 list organized by region
- **Your Favorites**:
  - Currencies: TRY, RSD, RUB, USD, EUR, USDC, USDT
  - Countries: TR, RS, RU, US
- **One-click add**: Star buttons for instant addition
- **Visual highlighting**: Yellow background and ⭐ for favorites
- **Template filling**: Select from dropdown to auto-fill forms

### �📁 Project Structure

```
budget/
├── electron/                 # Backend (Electron main process)
│   ├── main.ts              # Main process entry point
│   ├── preload.ts           # IPC bridge
│   └── database/
│       └── database.ts      # SQLite database + encryption
│
├── src/                     # Frontend (React app)
│   ├── components/
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── pages/
│   │   ├── Admin.tsx        # Admin panel
│   │   ├── Budgeting.tsx    # Transaction management
│   │   └── Analytics.tsx    # Charts and visualizations
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   ├── types.ts             # TypeScript type definitions
│   └── index.css            # Global styles
│
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
├── README.md                # Full documentation
├── QUICKSTART.md            # Getting started guide
├── TECHNICAL.md             # Technical documentation
├── seed-data.js             # Sample data seeder
└── .gitignore               # Git ignore rules
```

## 🚀 Next Steps

### 1. Install Node.js (if not already installed)

Download from: https://nodejs.org/
- Choose the **LTS version**
- Install both Node.js and npm

### 2. Install Dependencies

Open a terminal in the project folder and run:
```bash
npm install
```

This will install all required packages.

### 3. Run the Application

#### Development Mode:
```bash
npm run dev
```

#### Build for Production:
```bash
# For Windows
npm run build
npm run package:win

# For macOS
npm run build
npm run package:mac
```

### 4. First Time Setup

When you first run the app:

1. **Go to Admin Panel**
   - Add countries (e.g., USA, UK, Germany)
   - Add currencies (e.g., USD, GBP, EUR)
   - Create asset types (Checking, Savings, Investment)
   - Set up categories (Salary, Rent, Groceries, etc.)
   - Create your accounts

2. **Go to Budgeting**
   - Start adding transactions
   - Record exchanges between accounts
   - View your financial overview

3. **Go to Analytics**
   - See your money distribution
   - Analyze spending patterns
   - Track trends over time

### 5. Optional: Load Sample Data

To quickly test the app with sample data:
1. Open the app
2. Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools
3. Go to Console tab
4. Copy and paste the content of `seed-data.js`
5. Run `seedDatabase()`

This will create sample countries, currencies, accounts, and categories.

## 📋 Available Commands

```bash
npm run dev              # Start development mode (hot reload)
npm run build            # Build for production
npm run build:renderer   # Build React frontend only
npm run build:electron   # Build Electron backend only
npm start                # Run built application
npm run package          # Package for Windows and macOS
npm run package:win      # Package for Windows only
npm run package:mac      # Package for macOS only
```

## 💾 Data Storage

Your data is stored locally at:
- **Windows**: `%APPDATA%/budget-app/`
- **macOS**: `~/Library/Application Support/budget-app/`

Files:
- `budget.db` - Your encrypted database
- `.key` - Encryption key (KEEP THIS SAFE!)

**⚠️ IMPORTANT**: Back up both files regularly!

## 🎨 User Interface

The app has a clean, modern interface with:
- **Sidebar Navigation**: Easy switching between sections
- **Color-coded Transactions**: Green for income, red for expenses
- **Interactive Charts**: Visual representation of your finances
- **Responsive Tables**: Sortable data views
- **Modal Forms**: Easy data entry
- **Real-time Updates**: Changes reflected immediately

## 🔧 Customization

You can easily customize:
- **Colors**: Edit `src/index.css`
- **Categories**: Add more through Admin panel
- **Asset Types**: Define your own types
- **Database Schema**: Modify `electron/database/database.ts`
- **Charts**: Change chart types in `Analytics.tsx`

## 📚 Documentation

- **README.md**: Comprehensive overview and features
- **QUICKSTART.md**: Step-by-step getting started guide
- **TECHNICAL.md**: Deep dive into architecture and code
- **seed-data.js**: Example data for testing

## 🐛 Troubleshooting

### "npm is not recognized"
- Install Node.js from https://nodejs.org/

### Module not found errors
- Run: `npm install`

### App won't start
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Try `npm run build` before packaging

### TypeScript errors in IDE
- Wait for `npm install` to complete
- Restart your editor

## 🎯 What Makes This Special

1. **Privacy First**: Your data never leaves your computer
2. **Security**: Military-grade encryption (AES-256)
3. **Multi-currency**: Handle accounts in different currencies
4. **Multi-country**: Track finances across different countries
5. **Visual Analytics**: Beautiful charts and graphs
6. **Easy to Use**: Intuitive interface
7. **Cross-platform**: Works on Windows and macOS
8. **No Subscription**: One-time setup, use forever
9. **Offline**: Works without internet connection
10. **Open Source**: Full source code available

## 🚀 Future Ideas

Consider adding:
- [ ] PDF export of reports
- [ ] Budget goals and alerts
- [ ] Recurring transactions
- [ ] Dark mode theme
- [ ] Mobile companion app
- [ ] CSV import/export
- [ ] Multi-user support
- [ ] Password protection
- [ ] Automatic backups
- [ ] Financial forecasting

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Read QUICKSTART.md for setup instructions
3. Review TECHNICAL.md for architecture details
4. Check that Node.js is properly installed
5. Ensure all dependencies are installed (`npm install`)

## 🎉 You're Ready!

Your budget application is complete and ready to use. Just install Node.js, run `npm install`, then `npm run dev` to get started!

Happy budgeting! 💰📊
