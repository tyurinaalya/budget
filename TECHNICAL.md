# Budget Manager - Technical Documentation

## Architecture Overview

This application follows a modern desktop application architecture using Electron with React.

### Technology Stack

```
┌─────────────────────────────────────────┐
│           User Interface                │
│  (React + TypeScript + CSS)             │
└─────────────────┬───────────────────────┘
                  │
                  │ IPC (Inter-Process Communication)
                  │
┌─────────────────▼───────────────────────┐
│        Electron Main Process            │
│  (Node.js + TypeScript)                 │
└─────────────────┬───────────────────────┘
                  │
                  │ SQL Queries
                  │
┌─────────────────▼───────────────────────┐
│        Database Layer                   │
│  (SQLite + AES-256 Encryption)          │
└─────────────────────────────────────────┘
```

## Database Schema

### Tables

#### countries
```sql
CREATE TABLE countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### currencies
```sql
CREATE TABLE currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### asset_types
```sql
CREATE TABLE asset_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### accounts
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner TEXT,                    -- NEW: Optional owner field for family budgets
  currency_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  asset_type_id INTEGER NOT NULL,
  balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (currency_id) REFERENCES currencies(id),
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);
```

**Note:** The `owner` field was added in v1.2 for family budget tracking. Existing databases are automatically migrated.

#### categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### exchanges
```sql
CREATE TABLE exchanges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_account_id INTEGER NOT NULL,
  to_account_id INTEGER NOT NULL,
  from_amount REAL NOT NULL,
  to_amount REAL NOT NULL,
  exchange_rate REAL NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);
```

#### balance_adjustments (NEW in v1.6)
```sql
CREATE TABLE balance_adjustments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  old_balance REAL NOT NULL,
  new_balance REAL NOT NULL,
  difference REAL NOT NULL,
  reason TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

**Purpose**: Track balance updates that don't fit into income/expense transactions (investment gains, interest, corrections).

### Indexes
```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_accounts_country ON accounts(country_id);
CREATE INDEX idx_adjustments_date ON balance_adjustments(date);
CREATE INDEX idx_adjustments_account ON balance_adjustments(account_id);
```

### Database Migrations

The application includes an automatic migration system that runs on startup:

```typescript
private runMigrations() {
  // Check if accounts table has owner column, add it if not
  const tableInfo = this.db.prepare("PRAGMA table_info(accounts)").all();
  const hasOwner = tableInfo.some((col: any) => col.name === 'owner');
  
  if (!hasOwner && tableInfo.length > 0) {
    // Table exists but doesn't have owner column - add it
    this.db.exec('ALTER TABLE accounts ADD COLUMN owner TEXT');
  }
}
```

This ensures backward compatibility when new features are added.

## Data Files

### Official Lists (v1.1+)

The application includes official reference data for quick setup:

#### `src/data/currencies.ts`
- **168 currencies** from ISO 4217 standard
- Includes fiat currencies (USD, EUR, GBP, etc.)
- Includes cryptocurrencies (BTC, ETH, USDC, USDT, etc.)
- Structure:
  ```typescript
  interface CurrencyData {
    code: string;        // ISO 4217 code (e.g., "USD")
    name: string;        // Full name (e.g., "United States Dollar")
    symbol: string;      // Symbol (e.g., "$")
    countries: string[]; // Country codes using this currency
  }
  ```
- **Favorites**: `['TRY', 'RSD', 'RUB', 'USD', 'EUR', 'USDC', 'USDT']`

#### `src/data/countries.ts`
- **240+ countries** from ISO 3166-1 standard
- Organized by region (Europe, Asia, Americas, Africa, Oceania)
- Structure:
  ```typescript
  interface CountryData {
    code: string;   // ISO 3166-1 alpha-2 (e.g., "US")
    name: string;   // Official name (e.g., "United States")
    region: string; // Geographic region (e.g., "Americas")
  }
  ```
- **Favorites**: `['TR', 'RS', 'RU', 'US']`

These files serve as templates for quick-add functionality in the Admin panel.

## Exchange Rate Service (v1.3)

### Overview

The `ExchangeRateService` provides real-time currency conversion using live exchange rates.

**Location:** `src/services/exchangeRate.ts`

### Features

- **Live Rates**: Fetches from exchangerate-api.com
- **Smart Caching**: 1-hour cache to minimize API calls
- **Offline Support**: Uses localStorage cached rates
- **Multi-Currency**: Convert between any supported currencies

### API

```typescript
class ExchangeRateService {
  // Get exchange rates for a base currency
  static async getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates>
  
  // Convert amount from one currency to another
  static async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number>
  
  // Get exchange rate between two currencies
  static async getRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number>
  
  // Convert multiple balances to target currency
  static async convertBalances(
    balances: Array<{ amount: number; currency: string }>,
    targetCurrency: string
  ): Promise<number>
  
  // Force refresh rates from API
  static async forceRefresh(baseCurrency: string): Promise<ExchangeRates>
  
  // Get cache age in minutes
  static getCacheAge(): number
}
```

### Usage Example

```typescript
// Convert 100 USD to EUR
const euros = await ExchangeRateService.convert(100, 'USD', 'EUR');

// Convert multiple account balances to USD
const balances = [
  { amount: 1000, currency: 'RUB' },
  { amount: 500, currency: 'EUR' },
  { amount: 200, currency: 'TRY' }
];
const totalUSD = await ExchangeRateService.convertBalances(balances, 'USD');

// Force refresh if rates are stale
if (ExchangeRateService.getCacheAge() > 60) {
  await ExchangeRateService.forceRefresh('USD');
}
```

### Caching Strategy

- **Duration**: 1 hour (3600000 ms)
- **Storage**: localStorage with key `exchange_rates_cache`
- **Fallback**: Uses cached rates if API unavailable
- **Automatic**: Refreshes automatically when cache expires

### API Details

- **Provider**: exchangerate-api.com
- **Endpoint**: `https://api.exchangerate-api.com/v4/latest/{currency}`
- **Free Tier**: 1500 requests/month (sufficient with 1-hour caching)
- **No Auth**: No API key required for free tier

### Error Handling

```typescript
try {
  const converted = await ExchangeRateService.convert(100, 'USD', 'EUR');
} catch (error) {
  // Falls back to cached rates or returns original amount
  console.error('Conversion failed, using fallback');
}
```

## Encryption

### Implementation

The application uses AES-256-CBC encryption:

```typescript
// Key Generation (first run)
const encryptionKey = crypto.randomBytes(32); // 256 bits
fs.writeFileSync(keyPath, encryptionKey, { mode: 0o600 });

// Encryption
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
let encrypted = cipher.update(text, 'utf8', 'hex');
encrypted += cipher.final('hex');
return iv.toString('hex') + ':' + encrypted;

// Decryption
const parts = text.split(':');
const iv = Buffer.from(parts[0], 'hex');
const encryptedText = parts[1];
const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
decrypted += decipher.final('utf8');
return decrypted;
```

### Security Considerations

1. **Key Storage**: Encryption key is stored in user data directory with restricted permissions (0o600)
2. **IV Generation**: New initialization vector for each encryption operation
3. **Database**: SQLite database stores encrypted sensitive data
4. **No Network**: Application works entirely offline, no data leaves the device

## IPC Communication

### Pattern

```typescript
// Electron Main (electron/main.ts)
ipcMain.handle('get-countries', () => dbService.getCountries());

// Preload Script (electron/preload.ts)
contextBridge.exposeInMainWorld('electronAPI', {
  getCountries: () => ipcRenderer.invoke('get-countries'),
});

// React Component
const countries = await window.electronAPI.getCountries();
```

### Available IPC Channels

**Countries:**
- `get-countries` - Retrieve all countries
- `add-country` - Add new country
- `update-country` - Update existing country
- `delete-country` - Delete country

**Currencies:**
- `get-currencies`, `add-currency`, `update-currency`, `delete-currency`

**Accounts:**
- `get-accounts`, `add-account`, `update-account`, `delete-account`

**Categories:**
- `get-categories`, `add-category`, `update-category`, `delete-category`

**Asset Types:**
- `get-asset-types`, `add-asset-type`, `update-asset-type`, `delete-asset-type`

**Transactions:**
- `get-transactions` - Get transactions with filters
- `add-transaction` - Add transaction (updates balance)
- `update-transaction` - Update transaction (adjusts balances)
- `delete-transaction` - Delete transaction (reverts balance)

**Exchanges:**
- `get-exchanges` - Get all exchanges
- `add-exchange` - Add exchange (updates both account balances)

**Balance Adjustments (v1.6):**
- `get-balance-adjustments` - Get adjustments (optional accountId filter)
- `add-balance-adjustment` - Add adjustment (records old/new balance, updates account)
- `delete-balance-adjustment` - Delete adjustment (reverts balance to old value)

**Analytics:**
- `get-balance-by-country` - Aggregate balance by country (optional owner filter)
- `get-balance-by-currency` - Aggregate balance by currency (optional owner filter)
- `get-balance-by-asset-type` - Aggregate balance by asset type (optional owner filter)
- `get-accounts-by-owner` - Get accounts filtered by owner
- `get-unique-owners` - Get list of all unique owners
- `get-expenses-by-category` - Get expenses grouped by category

## React Components

### Component Hierarchy

```
App
├── Sidebar
└── Pages
    ├── Admin
    │   ├── CountriesTable
    │   ├── CurrenciesTable
    │   ├── AccountsTable
    │   ├── CategoriesTable
    │   ├── AssetTypesTable
    │   └── FormModal
    ├── Budgeting
    │   ├── TransactionsTable
    │   ├── ExchangesTable
    │   ├── BulkTransactionEntry  (NEW in v1.4)
    │   └── BudgetingModal
    └── Analytics
        └── Charts (from recharts)
```

### Bulk Transaction Entry Component (v1.4)

Excel-like grid interface for adding multiple transactions at once.

**State Structure:**
```typescript
interface BulkTransactionRow {
  id: string;
  date: string;
  type: 'income' | 'expense';
  account_id: string;
  category_id: string;
  amount: string;
  description: string;
}
```

**Key Features:**
- Dynamic row management (add/remove/duplicate)
- Tab key navigation for fast data entry
- Type-based category filtering
- Batch validation and saving
- Visual feedback (color-coded transaction types)

**Validation:**
- Required: date, account_id, category_id, amount
- Amount must be > 0
- Incomplete rows automatically skipped

**Usage Pattern:**
```typescript
// Save all valid rows
for (const row of validRows) {
  await window.electronAPI.addTransaction({
    account_id: parseInt(row.account_id),
    category_id: parseInt(row.category_id),
    amount: parseFloat(row.amount),
    type: row.type,
    description: row.description,
    date: row.date,
  });
}
```

### State Management

Currently using React hooks (useState, useEffect) for local state management. For a larger application, consider:
- Context API for global state
- Redux for complex state management
- React Query for server state (if adding backend)

## Build Process

### Development Build

```bash
npm run dev
```

1. Vite starts dev server (port 5173)
2. TypeScript compiles Electron main process
3. Electron launches with dev server URL
4. Hot Module Replacement (HMR) enabled

### Production Build

```bash
npm run build
npm run package
```

1. `npm run build:renderer` - Vite builds React app to `dist/renderer/`
2. `npm run build:electron` - TypeScript compiles to `dist/main.js` and `dist/preload.js`
3. `electron-builder` packages everything into installer

### Build Configuration

**electron-builder** configuration in package.json:

```json
{
  "build": {
    "appId": "com.budget.app",
    "productName": "Budget Manager",
    "files": ["dist/**/*", "package.json"],
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.finance"
    }
  }
}
```

## Performance Considerations

### Database Queries

- Indexes on frequently queried columns (date, account_id, country_id)
- Prepared statements for better performance
- Synchronous database operations (better-sqlite3) for simplicity

### React Optimization

Current optimizations:
- Component re-renders minimized with proper state management
- Data loaded only when needed (useEffect dependencies)

Potential improvements:
- Implement React.memo for expensive components
- Virtualization for large transaction lists
- Debouncing for filter inputs

## Testing Strategy

### Recommended Tests

**Unit Tests:**
- Database operations (CRUD)
- Encryption/decryption functions
- Balance calculations

**Integration Tests:**
- IPC communication
- Transaction balance updates
- Exchange calculations

**E2E Tests:**
- User workflows (add account → add transaction → view analytics)
- Cross-platform testing (Windows/macOS)

**Tools:**
- Jest for unit tests
- Spectron/Playwright for E2E tests
- React Testing Library for component tests

## Deployment

### Distribution

**Windows:**
- NSIS installer (.exe)
- Portable version (optional)

**macOS:**
- DMG disk image
- Code signing recommended for distribution

### Auto-updates

Not currently implemented. Consider:
- electron-updater for auto-updates
- GitHub Releases for hosting updates
- Signed updates for security

## Future Enhancements

### High Priority
1. **Data Export/Import**: CSV, JSON, PDF reports
2. **Backup/Restore**: UI for database backup
3. **Budget Goals**: Set and track budget limits
4. **Recurring Transactions**: Automate regular expenses/income

### Medium Priority
1. **Multi-language**: i18n support
2. **Dark Mode**: Theme switching
3. **Search**: Full-text search across transactions
4. **Tags**: Additional categorization

### Low Priority
1. **Cloud Sync**: Optional encrypted cloud backup
2. **Mobile App**: Companion mobile application
3. **Reports**: Customizable PDF reports
4. **API**: REST API for integrations

## Performance Benchmarks

Expected performance (on modern hardware):
- Database initialization: < 100ms
- Transaction query (1000 records): < 50ms
- Add transaction: < 10ms
- Analytics calculation: < 100ms
- App startup: < 2 seconds

## Troubleshooting Development Issues

### TypeScript Errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` settings
- Verify `@types/*` packages are installed

### Electron Not Starting
- Check console for errors
- Verify `dist/main.js` was built
- Try `npm run build:electron` separately

### React Hot Reload Not Working
- Ensure Vite dev server is running
- Check port 5173 is not in use
- Restart development server

### Database Errors
- Check file permissions
- Verify SQLite syntax
- Test queries in sqlite3 CLI

## Contributing Guidelines

1. **Code Style**: Follow existing TypeScript/React patterns
2. **Commits**: Use conventional commits (feat:, fix:, docs:)
3. **Testing**: Add tests for new features
4. **Documentation**: Update README and this doc for major changes

## License

MIT License - See LICENSE file for details
