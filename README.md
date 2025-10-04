# Budget Manager

A secure, multiplatfor#### 3. Analytics
Visualize your financial data:
- **👤 Owner Filter**: NEW in v1.5! View data for all accounts or filter by specific owner
- **💼 All Accounts List**: See all accounts with current balances in one view
- **🏦 Balance by Asset Type**: View distribution across Checking, Savings, Investment, etc.
- **💱 Unified Total Balance**: Select any currency to see your complete portfolio value
- **Balance by Country**: See how much money you have in each country
- **Balance by Currency**: View distribution across different currencies
- **Expenses by Category**: Analyze spending patterns
- **Interactive Charts**: Bar charts and pie charts for better insights
- **Real-Time Conversion**: All balances automatically converted using current exchange rates

#### 4. Reports (NEW in v1.7!)
Generate and review monthly financial reports with beautiful UI:
- **📊 Report Generation**: Create comprehensive reports for any date range directly in Reports page
- **💱 Multi-Currency Support**: All amounts shown in original currency AND converted to report currency
- **📈 Category Breakdown**: Income and expenses grouped by category with transaction counts
- **💰 Exchange Rate Snapshot**: Captures rates for ALL your account currencies (not just used in period)
- **🕐 Generation Timestamp**: Reports show exactly when they were generated and rates captured
- **📅 Report Archive**: Save reports and access them anytime with beautiful table view
- **💼 Investment Tracking**: Balance adjustments included in reports
- **🎯 Summary Cards**: Large, visual cards showing totals (income, expense, net change)
- **🎨 Modern UI**: Gradient headers, color-coded data, hover effects, professional designnagement application for Windows and macOS with encrypted local data storage.

## Features

### 🔐 Security
- **Local-only storage**: All data stays on your computer
- **Encrypted database**: Your financial data is encrypted with AES-256
- **Automatic key generation**: Encryption keys are generated automatically and securely stored

### 📊 Three Main Workspaces

#### 1. Admin Panel
Configure your budget system:
- **Countries**: Add countries from an official ISO 3166-1 list with quick-add favorites (TR, RS, RU, US)
- **Currencies**: Add currencies from the official ISO 4217 list with quick-add favorites (TRY, RSD, RUB, USD, EUR, USDC, USDT)
- **Accounts**: Create accounts linked to countries, currencies, and asset types - now with **owner field** for family budgets!
- **Categories**: Set up income and expense categories
- **Asset Types**: Define asset types (Investment, Savings, Checking, etc.)

**New in v1.3**: 
- 💱 **Real-Time Exchange Rates**: Automatic currency conversion using live market rates
- 🌍 **Unified Balance View**: See your total balance in any currency (USD, EUR, RUB, etc.)
- 🔄 **Auto-Refresh**: Exchange rates cached for 1 hour, refresh on demand
- 📊 **Multi-Currency Analytics**: View consolidated balance across all your currencies

**v1.2 Features**: 
- 👨‍👩‍👧‍👦 **Owner field** for accounts - perfect for tracking family member accounts!
- ⭐ Quick-add buttons for frequently used currencies and countries with favorites highlighting

#### 2. Budgeting
Manage your daily finances:
- **Transactions**: Record income and expenses
- **📊 Bulk Entry**: Add multiple transactions at once with Excel-like grid interface
- **💰 Balance Adjustments**: NEW in v1.6! Update account balances without transactions (perfect for investments)
- **Money Exchanges**: Track currency exchanges between accounts
- **Filters**: View transactions by date, account, or type
- **💱 Real-time Balance**: See total balance converted to any currency with live exchange rates
- **Currency Selector**: Choose display currency (USD, EUR, RUB, RSD, etc.)
- **Statistics**: View income, expenses, and net change

#### 3. Analytics
Visualize your financial data:
- **� Owner Filter**: NEW in v1.5! View data for all accounts or filter by specific owner
- **💼 All Accounts List**: See all accounts with current balances in one view
- **🏦 Balance by Asset Type**: View distribution across Checking, Savings, Investment, etc.
- **�💱 Unified Total Balance**: Select any currency to see your complete portfolio value
- **Balance by Country**: See how much money you have in each country
- **Balance by Currency**: View distribution across different currencies
- **Expenses by Category**: Analyze spending patterns
- **Interactive Charts**: Bar charts and pie charts for better insights
- **Real-Time Conversion**: All balances automatically converted using current exchange rates

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- **Windows:** Visual Studio Build Tools (automatically installed with npm)
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)

### Platform-Specific Guides
- **📱 macOS Setup:** See [MACOS_SETUP.md](./MACOS_SETUP.md) for detailed macOS installation and troubleshooting
- **🪟 Windows:** Follow the setup below (current system)

### Quick Setup (Windows & macOS)

1. **Install dependencies**:
```bash
npm install
```

2. **Run in development mode**:
```bash
npm run dev
```

This will:
- Start the Vite development server for the React frontend
- Launch Electron with hot-reload support
- Open the application window

3. **Build for production**:

For Windows:
```bash
npm run build
npm run package:win
```

For macOS:
```bash
npm run build
npm run package:mac
```

For both platforms:
```bash
npm run build
npm run package
```

Built applications will be in the `release/` directory.

**🚀 Cross-Platform Builds**: Want to build for macOS from Windows (or vice versa)? See [GitHub Actions Guide](GITHUB_ACTIONS_GUIDE.md) for automated CI/CD builds on both platforms!

### First Run
On first launch, the app will create:
- `budget.db` - Your encrypted database
- `.key` - Your encryption key (keep this safe!)

**Storage Locations:**
- **Windows:** `%APPDATA%\budget-app\`
- **macOS:** `~/Library/Application Support/budget-app/`

## Project Structure

```
budget/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script for IPC
│   └── database/         # Database layer
│       └── database.ts   # SQLite database with encryption
├── src/                  # React frontend
│   ├── components/       # React components
│   │   ├── Sidebar.tsx
│   │   └── ReportGenerator.tsx
│   ├── pages/           # Main pages
│   │   ├── Admin.tsx
│   │   ├── Budgeting.tsx
│   │   ├── Analytics.tsx
│   │   └── Reports.tsx
│   ├── services/        # Business logic
│   │   └── exchangeRate.ts
│   ├── types.ts         # TypeScript types
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config for React
├── tsconfig.electron.json # TypeScript config for Electron
└── vite.config.ts       # Vite configuration
```

## Technology Stack

- **Electron**: Cross-platform desktop framework
- **React**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **SQLite** (better-sqlite3): Local database
- **Recharts**: Data visualization
- **Node.js crypto**: Data encryption

## Data Storage

The application stores data in your system's user data directory:

- **Windows**: `%APPDATA%/budget-app/`
- **macOS**: `~/Library/Application Support/budget-app/`

Files:
- `budget.db` - SQLite database with encrypted data
- `.key` - Encryption key (automatically generated, keep secure!)

## Security Notes

1. **Backup your encryption key**: The `.key` file in your user data directory is essential for accessing your data. Back it up securely!

2. **Database backup**: Regularly backup your `budget.db` file along with the `.key` file.

3. **No cloud sync**: This app works entirely offline. If you want to sync between devices, you'll need to manually copy the database and key files.

## Development

### Available Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run build:renderer` - Build React app only
- `npm run build:electron` - Build Electron main process only
- `npm run package:win` - Package for Windows
- `npm run package:mac` - Package for macOS
- `npm start` - Start built application

### Adding Features

The architecture is modular:
- Add new IPC handlers in `electron/main.ts`
- Add new database methods in `electron/database/database.ts`
- Add new React components in `src/components/` or `src/pages/`
- Update types in `src/types.ts`

## Troubleshooting

### Database Errors
If you encounter database errors, check:
1. File permissions on the user data directory
2. The `.key` file exists and is readable
3. The `budget.db` file is not corrupted

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear `node_modules` and reinstall if needed
- Check that you have the correct Node.js version

## License

MIT License - feel free to modify and distribute as needed.

## Version History

### v1.10.2 - Bidirectional Manual Rates (Latest)
- 🎯 **Smart Rate Detection**: Enter rates in EITHER direction (BTC→USD OR USD→BTC)
- ✅ **Automatic Inversion**: System intelligently inverts rates when needed
- ✅ **Priority System**: Direct manual rates checked first, then inverse, then API
- ✅ **Improved Logging**: Clear console messages showing which rate source is used
- 📝 **Documentation**: Created BIDIRECTIONAL_RATES.md with comprehensive examples
- 🚀 **User-Friendly**: No more confusion about which direction to enter rates!

### v1.10.1 - Manual Rates Bug Fix
- 🐛 **Critical Fix**: Manual exchange rates now work in Analytics page
- ✅ **Total Balance**: Correctly uses manual rates for cryptocurrencies
- ✅ **All Conversions**: ExchangeRateService now merges manual rates with API rates
- ✅ **Console Logging**: Added debugging logs to verify rate usage
- 📝 **Documentation**: Created BUGFIX_MANUAL_RATES.md with detailed explanation

### v1.10 - Manual Exchange Rates
- ✅ **Manual Exchange Rates**: Add custom exchange rates for cryptocurrencies and unsupported currencies
- ✅ **Database Storage**: Rates stored in SQLite with timestamps
- ✅ **Automatic Fallback**: System uses manual rates when API doesn't provide them
- ✅ **Admin Interface**: New "Exchange Rates" tab in Admin panel
- ✅ **Precision Support**: Up to 8 decimal places for accurate crypto rates
- ✅ **Smart Integration**: Seamlessly integrated into report generation
- ✅ **User-Friendly Form**: Dropdown currency selectors with clear instructions

### v1.9 - Enhanced Expense Reports
- ✅ **Expenses Grouped by Currency**: Reports now show expenses organized by currency blocks
- ✅ **Category Details**: Each currency block displays all categories with amounts
- ✅ **Visual Hierarchy**: Beautiful gradient cards for each currency with totals
- ✅ **Percentage Bars**: Visual progress bars showing category percentage within each currency
- ✅ **Smart Conversion**: Shows both original amounts and converted values
- ✅ **Currency Totals**: Each currency block shows total expenses with conversion

### v1.8 - European Date Format
- ✅ **European Date Format**: All dates displayed in DD.MM.YYYY format (e.g., 29.09.2025)
- ✅ **Consistent DateTime**: Timestamps shown as DD.MM.YYYY HH:MM:SS format
- ✅ **Global Formatting**: Applied across all pages (Budgeting, Reports, Analytics)
- ✅ **User-Friendly**: More intuitive for European users

### v1.7 - Monthly Reports
- ✅ **Beautiful Reports Page**: Redesigned with modern UI, gradients, and visual hierarchy
- ✅ **Report Generation**: Create reports directly in Reports page (moved from Budgeting)
- ✅ **Multi-Currency Support**: Shows amounts in original + converted currency with proper conversion (divide by rate)
- ✅ **Smart Exchange Rates**: Captures rates for ALL account currencies, not just those used in period
- ✅ **Generation Timestamp**: Reports display when generated and rates captured
- ✅ **Exchange Rates at Bottom**: Better flow - data first, rates for reference at end
- ✅ **Category Breakdown**: Income/expenses grouped by category with transaction counts
- ✅ **Visual Summary Cards**: Large gradient cards for income, expense, net change
- ✅ **Report Archive**: Beautiful table with color-coded badges and hover effects

### v1.6 - Balance Adjustments
- ✅ **Balance Adjustments**: Update account balances without creating transactions
- ✅ **Adjustment History**: Track all balance changes with reasons and dates
- ✅ **Investment Tracking**: Perfect for recording investment gains/losses
- ✅ **Non-Transaction Updates**: Interest earned, corrections, market value changes

### v1.5 - Enhanced Analytics
- ✅ **Owner Filter**: Filter all analytics by specific owner or view all
- ✅ **Accounts Overview**: See all accounts with balances in one table
- ✅ **Asset Type Analytics**: View balance distribution by asset type
- ✅ **Family Insights**: Perfect for tracking individual or family finances

### v1.4 - Bulk Transaction Entry
- ✅ **Excel-like Bulk Entry**: Add multiple transactions at once with grid interface
- ✅ **Row Management**: Add, duplicate, and remove rows easily
- ✅ **Smart Validation**: Only save complete rows, warnings for incomplete data
- ✅ **Keyboard Navigation**: Tab key support for fast data entry
- ✅ **Visual Feedback**: Color-coded transaction types, row numbering

### v1.3 - Real-Time Exchange Rates
- ✅ **Live Currency Conversion**: Automatic exchange rate updates from exchangerate-api.com
- ✅ **Unified Balance View**: See total balance in any currency across all accounts
- ✅ **Smart Caching**: 1-hour cache with manual refresh option
- ✅ **Offline Support**: Works with cached rates when API unavailable

### v1.2 - Family Budget Support
- ✅ **Owner Field**: Track which family member owns each account
- ✅ **Database Migration**: Automatic schema updates

### v1.1 - Official Data Lists
- ✅ **ISO 4217 Currencies**: 168 official currencies including cryptocurrencies
- ✅ **ISO 3166-1 Countries**: 240+ countries organized by region
- ✅ **Quick-Add Favorites**: Star buttons for commonly used items
- ✅ **Visual Indicators**: Yellow highlighting for favorite items

### v1.0 - Initial Release
- ✅ Core budget management features
- ✅ AES-256 encryption
- ✅ Transaction tracking
- ✅ Analytics and charts

## Future Enhancements

Potential features to add:
- [ ] CSV import for bulk transactions
- [ ] Data export (CSV, JSON)
- [ ] Budget goals and alerts
- [ ] Recurring transactions
- [ ] Template saving for bulk entries
- [ ] Reports generation (PDF)
- [ ] Dark mode theme
- [ ] Database backup/restore from UI
- [ ] Password protection on app startup

## Contributing

This is a personal project, but suggestions and improvements are welcome!
