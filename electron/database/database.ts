import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export class DatabaseService {
  private db: Database.Database;
  private encryptionKey: Buffer;

  constructor(userDataPath: string) {
    const dbPath = path.join(userDataPath, 'budget.db');
    
    // Generate or load encryption key
    const keyPath = path.join(userDataPath, '.key');
    if (fs.existsSync(keyPath)) {
      this.encryptionKey = fs.readFileSync(keyPath);
    } else {
      this.encryptionKey = crypto.randomBytes(32);
      fs.writeFileSync(keyPath, this.encryptionKey, { mode: 0o600 });
    }

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private runMigrations() {
    // Check if accounts table has owner column, add it if not
    const tableInfo = this.db.prepare("PRAGMA table_info(accounts)").all() as any[];
    const hasOwner = tableInfo.some((col: any) => col.name === 'owner');
    
    if (!hasOwner && tableInfo.length > 0) {
      // Table exists but doesn't have owner column - add it
      console.log('Adding owner column to accounts table...');
      this.db.exec('ALTER TABLE accounts ADD COLUMN owner TEXT');
    }

    // Check if balance_adjustments table exists
    const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='balance_adjustments'").all();
    if (tables.length === 0) {
      console.log('Creating balance_adjustments table...');
      this.db.exec(`
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
        CREATE INDEX idx_adjustments_date ON balance_adjustments(date);
        CREATE INDEX idx_adjustments_account ON balance_adjustments(account_id);
      `);
    }

    // Check if monthly_reports table exists
    const reportTables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='monthly_reports'").all();
    if (reportTables.length === 0) {
      console.log('Creating monthly_reports table...');
      this.db.exec(`
        CREATE TABLE monthly_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_name TEXT NOT NULL,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          report_currency TEXT NOT NULL,
          exchange_rates TEXT NOT NULL,
          report_data TEXT NOT NULL,
          total_income REAL NOT NULL,
          total_expense REAL NOT NULL,
          net_change REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_reports_date ON monthly_reports(period_start, period_end);
      `);
    }

    // Check if manual_exchange_rates table exists
    const manualRatesTables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='manual_exchange_rates'").all();
    if (manualRatesTables.length === 0) {
      console.log('Creating manual_exchange_rates table...');
      this.db.exec(`
        CREATE TABLE manual_exchange_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          from_currency TEXT NOT NULL,
          to_currency TEXT NOT NULL,
          rate REAL NOT NULL,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(from_currency, to_currency)
        );
        CREATE INDEX idx_manual_rates_from ON manual_exchange_rates(from_currency);
        CREATE INDEX idx_manual_rates_to ON manual_exchange_rates(to_currency);
      `);
    }
  }

  private initializeDatabase() {
    // Run migrations first
    this.runMigrations();
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS currencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        symbol TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS asset_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        owner TEXT,
        currency_id INTEGER NOT NULL,
        country_id INTEGER NOT NULL,
        asset_type_id INTEGER NOT NULL,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (currency_id) REFERENCES currencies(id),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
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

      CREATE TABLE IF NOT EXISTS exchanges (
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

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_accounts_country ON accounts(country_id);
    `);
  }

  // Countries
  getCountries() {
    return this.db.prepare('SELECT * FROM countries ORDER BY name').all();
  }

  addCountry(country: { name: string; code: string }) {
    const stmt = this.db.prepare('INSERT INTO countries (name, code) VALUES (?, ?)');
    return stmt.run(country.name, country.code);
  }

  updateCountry(id: number, country: { name: string; code: string }) {
    const stmt = this.db.prepare('UPDATE countries SET name = ?, code = ? WHERE id = ?');
    return stmt.run(country.name, country.code, id);
  }

  deleteCountry(id: number) {
    const stmt = this.db.prepare('DELETE FROM countries WHERE id = ?');
    return stmt.run(id);
  }

  // Currencies
  getCurrencies() {
    return this.db.prepare('SELECT * FROM currencies ORDER BY name').all();
  }

  addCurrency(currency: { name: string; code: string; symbol: string }) {
    const stmt = this.db.prepare('INSERT INTO currencies (name, code, symbol) VALUES (?, ?, ?)');
    return stmt.run(currency.name, currency.code, currency.symbol);
  }

  updateCurrency(id: number, currency: { name: string; code: string; symbol: string }) {
    const stmt = this.db.prepare('UPDATE currencies SET name = ?, code = ?, symbol = ? WHERE id = ?');
    return stmt.run(currency.name, currency.code, currency.symbol, id);
  }

  deleteCurrency(id: number) {
    const stmt = this.db.prepare('DELETE FROM currencies WHERE id = ?');
    return stmt.run(id);
  }

  // Asset Types
  getAssetTypes() {
    return this.db.prepare('SELECT * FROM asset_types ORDER BY name').all();
  }

  addAssetType(assetType: { name: string; description?: string }) {
    const stmt = this.db.prepare('INSERT INTO asset_types (name, description) VALUES (?, ?)');
    return stmt.run(assetType.name, assetType.description || null);
  }

  updateAssetType(id: number, assetType: { name: string; description?: string }) {
    const stmt = this.db.prepare('UPDATE asset_types SET name = ?, description = ? WHERE id = ?');
    return stmt.run(assetType.name, assetType.description || null, id);
  }

  deleteAssetType(id: number) {
    const stmt = this.db.prepare('DELETE FROM asset_types WHERE id = ?');
    return stmt.run(id);
  }

  // Accounts
  getAccounts() {
    return this.db.prepare(`
      SELECT a.*, c.name as country_name, cur.code as currency_code, 
             cur.symbol as currency_symbol, at.name as asset_type_name
      FROM accounts a
      JOIN countries c ON a.country_id = c.id
      JOIN currencies cur ON a.currency_id = cur.id
      JOIN asset_types at ON a.asset_type_id = at.id
      ORDER BY a.name
    `).all();
  }

  addAccount(account: { name: string; owner?: string; currency_id: number; country_id: number; asset_type_id: number; balance: number }) {
    const stmt = this.db.prepare(
      'INSERT INTO accounts (name, owner, currency_id, country_id, asset_type_id, balance) VALUES (?, ?, ?, ?, ?, ?)'
    );
    return stmt.run(account.name, account.owner || null, account.currency_id, account.country_id, account.asset_type_id, account.balance);
  }

  updateAccount(id: number, account: { name: string; owner?: string; currency_id: number; country_id: number; asset_type_id: number; balance: number }) {
    const stmt = this.db.prepare(
      'UPDATE accounts SET name = ?, owner = ?, currency_id = ?, country_id = ?, asset_type_id = ?, balance = ? WHERE id = ?'
    );
    return stmt.run(account.name, account.owner || null, account.currency_id, account.country_id, account.asset_type_id, account.balance, id);
  }

  deleteAccount(id: number) {
    const stmt = this.db.prepare('DELETE FROM accounts WHERE id = ?');
    return stmt.run(id);
  }

  // Categories
  getCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY type, name').all();
  }

  addCategory(category: { name: string; type: string }) {
    const stmt = this.db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
    return stmt.run(category.name, category.type);
  }

  updateCategory(id: number, category: { name: string; type: string }) {
    const stmt = this.db.prepare('UPDATE categories SET name = ?, type = ? WHERE id = ?');
    return stmt.run(category.name, category.type, id);
  }

  deleteCategory(id: number) {
    const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
    return stmt.run(id);
  }

  // Transactions
  getTransactions(filters?: { startDate?: string; endDate?: string; accountId?: number; type?: string }) {
    let query = `
      SELECT t.*, a.name as account_name, c.name as category_name,
             cur.symbol as currency_symbol
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN categories c ON t.category_id = c.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND t.date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND t.date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.accountId) {
      query += ' AND t.account_id = ?';
      params.push(filters.accountId);
    }
    if (filters?.type) {
      query += ' AND t.type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    return this.db.prepare(query).all(...params);
  }

  addTransaction(transaction: { account_id: number; category_id: number; amount: number; type: string; description?: string; date: string }) {
    const stmt = this.db.prepare(
      'INSERT INTO transactions (account_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      transaction.account_id,
      transaction.category_id,
      transaction.amount,
      transaction.type,
      transaction.description || null,
      transaction.date
    );

    // Update account balance
    const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
      .run(balanceChange, transaction.account_id);

    return result;
  }

  updateTransaction(id: number, transaction: { account_id: number; category_id: number; amount: number; type: string; description?: string; date: string }) {
    // Get old transaction to revert balance
    const oldTx: any = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (oldTx) {
      const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
        .run(oldBalanceChange, oldTx.account_id);
    }

    // Update transaction
    const stmt = this.db.prepare(
      'UPDATE transactions SET account_id = ?, category_id = ?, amount = ?, type = ?, description = ?, date = ? WHERE id = ?'
    );
    const result = stmt.run(
      transaction.account_id,
      transaction.category_id,
      transaction.amount,
      transaction.type,
      transaction.description || null,
      transaction.date,
      id
    );

    // Apply new balance
    const newBalanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
      .run(newBalanceChange, transaction.account_id);

    return result;
  }

  deleteTransaction(id: number) {
    // Get transaction to revert balance
    const tx: any = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (tx) {
      const balanceChange = tx.type === 'income' ? -tx.amount : tx.amount;
      this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
        .run(balanceChange, tx.account_id);
    }

    const stmt = this.db.prepare('DELETE FROM transactions WHERE id = ?');
    return stmt.run(id);
  }

  // Exchanges
  getExchanges() {
    return this.db.prepare(`
      SELECT e.*, 
             fa.name as from_account_name, 
             ta.name as to_account_name,
             fc.symbol as from_currency_symbol,
             tc.symbol as to_currency_symbol
      FROM exchanges e
      JOIN accounts fa ON e.from_account_id = fa.id
      JOIN accounts ta ON e.to_account_id = ta.id
      JOIN currencies fc ON fa.currency_id = fc.id
      JOIN currencies tc ON ta.currency_id = tc.id
      ORDER BY e.date DESC
    `).all();
  }

  addExchange(exchange: { from_account_id: number; to_account_id: number; from_amount: number; to_amount: number; exchange_rate: number; date: string; description?: string }) {
    const stmt = this.db.prepare(
      'INSERT INTO exchanges (from_account_id, to_account_id, from_amount, to_amount, exchange_rate, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      exchange.from_account_id,
      exchange.to_account_id,
      exchange.from_amount,
      exchange.to_amount,
      exchange.exchange_rate,
      exchange.date,
      exchange.description || null
    );

    // Update account balances
    this.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
      .run(exchange.from_amount, exchange.from_account_id);
    this.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
      .run(exchange.to_amount, exchange.to_account_id);

    return result;
  }

  // Analytics
  getBalanceByCountry(owner?: string) {
    const query = `
      SELECT c.name as country, c.code, 
             SUM(a.balance) as total_balance,
             cur.code as currency_code,
             cur.symbol as currency_symbol,
             COUNT(a.id) as account_count
      FROM accounts a
      JOIN countries c ON a.country_id = c.id
      JOIN currencies cur ON a.currency_id = cur.id
      ${owner ? 'WHERE a.owner = ?' : ''}
      GROUP BY c.id, cur.id
      ORDER BY c.name
    `;
    return owner ? this.db.prepare(query).all(owner) : this.db.prepare(query).all();
  }

  getBalanceByCurrency(owner?: string) {
    const query = `
      SELECT cur.name as currency, 
             cur.code, 
             cur.symbol,
             SUM(a.balance) as total_balance,
             COUNT(a.id) as account_count
      FROM accounts a
      JOIN currencies cur ON a.currency_id = cur.id
      ${owner ? 'WHERE a.owner = ?' : ''}
      GROUP BY cur.id
      ORDER BY total_balance DESC
    `;
    return owner ? this.db.prepare(query).all(owner) : this.db.prepare(query).all();
  }

  getBalanceByAssetType(owner?: string) {
    const query = `
      SELECT at.name as asset_type,
             SUM(a.balance) as total_balance,
             COUNT(a.id) as account_count,
             GROUP_CONCAT(DISTINCT cur.code) as currencies
      FROM accounts a
      JOIN asset_types at ON a.asset_type_id = at.id
      JOIN currencies cur ON a.currency_id = cur.id
      ${owner ? 'WHERE a.owner = ?' : ''}
      GROUP BY at.id
      ORDER BY total_balance DESC
    `;
    return owner ? this.db.prepare(query).all(owner) : this.db.prepare(query).all();
  }

  getAccountsByOwner(owner?: string) {
    const query = `
      SELECT a.*, c.name as country_name, cur.code as currency_code, 
             cur.symbol as currency_symbol, at.name as asset_type_name
      FROM accounts a
      JOIN countries c ON a.country_id = c.id
      JOIN currencies cur ON a.currency_id = cur.id
      JOIN asset_types at ON a.asset_type_id = at.id
      ${owner ? 'WHERE a.owner = ?' : ''}
      ORDER BY a.name
    `;
    return owner ? this.db.prepare(query).all(owner) : this.db.prepare(query).all();
  }

  getUniqueOwners() {
    return this.db.prepare(`
      SELECT DISTINCT owner
      FROM accounts
      WHERE owner IS NOT NULL AND owner != ''
      ORDER BY owner
    `).all();
  }

  // Balance Adjustments
  getBalanceAdjustments(accountId?: number) {
    if (accountId) {
      return this.db.prepare(`
        SELECT ba.*, a.name as account_name, cur.code as currency_code, cur.symbol as currency_symbol
        FROM balance_adjustments ba
        JOIN accounts a ON ba.account_id = a.id
        JOIN currencies cur ON a.currency_id = cur.id
        WHERE ba.account_id = ?
        ORDER BY ba.date DESC, ba.created_at DESC
      `).all(accountId);
    }
    return this.db.prepare(`
      SELECT ba.*, a.name as account_name, cur.code as currency_code, cur.symbol as currency_symbol
      FROM balance_adjustments ba
      JOIN accounts a ON ba.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      ORDER BY ba.date DESC, ba.created_at DESC
    `).all();
  }

  addBalanceAdjustment(adjustment: { account_id: number; new_balance: number; reason?: string; date: string }) {
    // Get current balance
    const account = this.db.prepare('SELECT balance FROM accounts WHERE id = ?').get(adjustment.account_id) as any;
    if (!account) {
      throw new Error('Account not found');
    }

    const oldBalance = account.balance;
    const difference = adjustment.new_balance - oldBalance;

    // Insert adjustment record
    const stmt = this.db.prepare(
      'INSERT INTO balance_adjustments (account_id, old_balance, new_balance, difference, reason, date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      adjustment.account_id,
      oldBalance,
      adjustment.new_balance,
      difference,
      adjustment.reason || null,
      adjustment.date
    );

    // Update account balance
    this.db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(adjustment.new_balance, adjustment.account_id);

    return result;
  }

  deleteBalanceAdjustment(id: number) {
    // Get the adjustment details
    const adjustment = this.db.prepare('SELECT * FROM balance_adjustments WHERE id = ?').get(id) as any;
    if (!adjustment) {
      throw new Error('Adjustment not found');
    }

    // Revert the account balance
    this.db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(adjustment.old_balance, adjustment.account_id);

    // Delete the adjustment
    const stmt = this.db.prepare('DELETE FROM balance_adjustments WHERE id = ?');
    return stmt.run(id);
  }

  // Monthly Reports
  getMonthlyReports() {
    return this.db.prepare(`
      SELECT * FROM monthly_reports
      ORDER BY period_start DESC, created_at DESC
    `).all();
  }

  getMonthlyReport(id: number) {
    return this.db.prepare('SELECT * FROM monthly_reports WHERE id = ?').get(id);
  }

  addMonthlyReport(report: {
    report_name: string;
    period_start: string;
    period_end: string;
    report_currency: string;
    exchange_rates: string;
    report_data: string;
    total_income: number;
    total_expense: number;
    net_change: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO monthly_reports (
        report_name, period_start, period_end, report_currency,
        exchange_rates, report_data, total_income, total_expense, net_change
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      report.report_name,
      report.period_start,
      report.period_end,
      report.report_currency,
      report.exchange_rates,
      report.report_data,
      report.total_income,
      report.total_expense,
      report.net_change
    );
  }

  deleteMonthlyReport(id: number) {
    const stmt = this.db.prepare('DELETE FROM monthly_reports WHERE id = ?');
    return stmt.run(id);
  }

  // Get report data for a period
  getReportData(startDate: string, endDate: string) {
    // Get all transactions in the period
    const transactions = this.db.prepare(`
      SELECT t.*, a.name as account_name, a.owner, 
             c.name as category_name, c.type as category_type,
             cur.code as currency_code, cur.symbol as currency_symbol
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN categories c ON t.category_id = c.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `).all(startDate, endDate);

    // Get income by category
    const incomeByCategory = this.db.prepare(`
      SELECT c.name as category, 
             SUM(t.amount) as total_amount,
             COUNT(t.id) as transaction_count,
             cur.code as currency_code,
             cur.symbol as currency_symbol
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE t.type = 'income' AND t.date BETWEEN ? AND ?
      GROUP BY c.id, cur.id
      ORDER BY total_amount DESC
    `).all(startDate, endDate);

    // Get expenses by category
    const expensesByCategory = this.db.prepare(`
      SELECT c.name as category,
             SUM(t.amount) as total_amount,
             COUNT(t.id) as transaction_count,
             cur.code as currency_code,
             cur.symbol as currency_symbol
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
      GROUP BY c.id, cur.id
      ORDER BY total_amount DESC
    `).all(startDate, endDate);

    // Get balance adjustments in the period
    const adjustments = this.db.prepare(`
      SELECT ba.*, a.name as account_name, cur.code as currency_code, cur.symbol as currency_symbol
      FROM balance_adjustments ba
      JOIN accounts a ON ba.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE ba.date BETWEEN ? AND ?
      ORDER BY ba.date DESC
    `).all(startDate, endDate);

    // Get all currencies used in accounts (for exchange rates)
    const accountCurrencies = this.db.prepare(`
      SELECT DISTINCT cur.code as currency_code
      FROM accounts a
      JOIN currencies cur ON a.currency_id = cur.id
    `).all();

    // Get expenses grouped by currency
    const expensesByCurrency = this.db.prepare(`
      SELECT cur.code as currency_code,
             cur.symbol as currency_symbol,
             SUM(t.amount) as total_amount,
             COUNT(t.id) as transaction_count
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
      GROUP BY cur.id
      ORDER BY total_amount DESC
    `).all(startDate, endDate);

    return {
      transactions,
      incomeByCategory,
      expensesByCategory,
      adjustments,
      accountCurrencies,
      expensesByCurrency,
    };
  }

  getExpensesByCategory(startDate: string, endDate: string) {
    return this.db.prepare(`
      SELECT c.name as category,
             SUM(t.amount) as total_amount,
             COUNT(t.id) as transaction_count,
             cur.symbol as currency_symbol
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      JOIN currencies cur ON a.currency_id = cur.id
      WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
      GROUP BY c.id, cur.id
      ORDER BY total_amount DESC
    `).all(startDate, endDate);
  }

  // Manual Exchange Rates
  getManualExchangeRates() {
    return this.db.prepare('SELECT * FROM manual_exchange_rates ORDER BY from_currency, to_currency').all();
  }

  getManualExchangeRate(fromCurrency: string, toCurrency: string) {
    return this.db.prepare('SELECT * FROM manual_exchange_rates WHERE from_currency = ? AND to_currency = ?')
      .get(fromCurrency, toCurrency);
  }

  addManualExchangeRate(rate: { from_currency: string; to_currency: string; rate: number; description?: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO manual_exchange_rates (from_currency, to_currency, rate, description, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(from_currency, to_currency) 
      DO UPDATE SET rate = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(
      rate.from_currency,
      rate.to_currency,
      rate.rate,
      rate.description || null,
      rate.rate,
      rate.description || null
    );
  }

  updateManualExchangeRate(id: number, rate: { from_currency: string; to_currency: string; rate: number; description?: string }) {
    const stmt = this.db.prepare(`
      UPDATE manual_exchange_rates 
      SET from_currency = ?, to_currency = ?, rate = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(rate.from_currency, rate.to_currency, rate.rate, rate.description || null, id);
  }

  deleteManualExchangeRate(id: number) {
    const stmt = this.db.prepare('DELETE FROM manual_exchange_rates WHERE id = ?');
    return stmt.run(id);
  }

  close() {
    this.db.close();
  }
}
