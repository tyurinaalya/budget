export interface Country {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  created_at: string;
}

export interface AssetType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
  owner?: string;
  currency_id: number;
  country_id: number;
  asset_type_id: number;
  balance: number;
  country_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  asset_type_name?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  account_name?: string;
  category_name?: string;
  currency_symbol?: string;
  created_at: string;
}

export interface Exchange {
  id: number;
  from_account_id: number;
  to_account_id: number;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  date: string;
  description?: string;
  from_account_name?: string;
  to_account_name?: string;
  from_currency_symbol?: string;
  to_currency_symbol?: string;
  created_at: string;
}

export interface BalanceAdjustment {
  id: number;
  account_id: number;
  old_balance: number;
  new_balance: number;
  difference: number;
  reason?: string;
  date: string;
  account_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  created_at: string;
}

export interface MonthlyReport {
  id: number;
  report_name: string;
  period_start: string;
  period_end: string;
  report_currency: string;
  exchange_rates: string;
  report_data: string;
  total_income: number;
  total_expense: number;
  net_change: number;
  created_at: string;
}

export interface ManualExchangeRate {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: number;
  description?: string;
  updated_at: string;
}

declare global {
  interface Window {
    electronAPI: {
      // Countries
      getCountries: () => Promise<Country[]>;
      addCountry: (country: Omit<Country, 'id' | 'created_at'>) => Promise<any>;
      updateCountry: (id: number, country: Omit<Country, 'id' | 'created_at'>) => Promise<any>;
      deleteCountry: (id: number) => Promise<any>;

      // Currencies
      getCurrencies: () => Promise<Currency[]>;
      addCurrency: (currency: Omit<Currency, 'id' | 'created_at'>) => Promise<any>;
      updateCurrency: (id: number, currency: Omit<Currency, 'id' | 'created_at'>) => Promise<any>;
      deleteCurrency: (id: number) => Promise<any>;

      // Accounts
      getAccounts: () => Promise<Account[]>;
      addAccount: (account: Omit<Account, 'id' | 'created_at' | 'country_name' | 'currency_code' | 'currency_symbol' | 'asset_type_name'>) => Promise<any>;
      updateAccount: (id: number, account: Omit<Account, 'id' | 'created_at' | 'country_name' | 'currency_code' | 'currency_symbol' | 'asset_type_name'>) => Promise<any>;
      deleteAccount: (id: number) => Promise<any>;

      // Categories
      getCategories: () => Promise<Category[]>;
      addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<any>;
      updateCategory: (id: number, category: Omit<Category, 'id' | 'created_at'>) => Promise<any>;
      deleteCategory: (id: number) => Promise<any>;

      // Asset Types
      getAssetTypes: () => Promise<AssetType[]>;
      addAssetType: (assetType: Omit<AssetType, 'id' | 'created_at'>) => Promise<any>;
      updateAssetType: (id: number, assetType: Omit<AssetType, 'id' | 'created_at'>) => Promise<any>;
      deleteAssetType: (id: number) => Promise<any>;

      // Transactions
      getTransactions: (filters?: { startDate?: string; endDate?: string; accountId?: number; type?: string }) => Promise<Transaction[]>;
      addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'account_name' | 'category_name' | 'currency_symbol'>) => Promise<any>;
      updateTransaction: (id: number, transaction: Omit<Transaction, 'id' | 'created_at' | 'account_name' | 'category_name' | 'currency_symbol'>) => Promise<any>;
      deleteTransaction: (id: number) => Promise<any>;

      // Exchanges
      getExchanges: () => Promise<Exchange[]>;
      addExchange: (exchange: Omit<Exchange, 'id' | 'created_at' | 'from_account_name' | 'to_account_name' | 'from_currency_symbol' | 'to_currency_symbol'>) => Promise<any>;

      // Analytics
      getBalanceByCountry: (owner?: string) => Promise<any[]>;
      getBalanceByCurrency: (owner?: string) => Promise<any[]>;
      getBalanceByAssetType: (owner?: string) => Promise<any[]>;
      getAccountsByOwner: (owner?: string) => Promise<any[]>;
      getUniqueOwners: () => Promise<any[]>;
      getExpensesByCategory: (startDate: string, endDate: string) => Promise<any[]>;

      // Balance Adjustments
      getBalanceAdjustments: (accountId?: number) => Promise<BalanceAdjustment[]>;
      addBalanceAdjustment: (adjustment: Omit<BalanceAdjustment, 'id' | 'old_balance' | 'difference' | 'created_at' | 'account_name' | 'currency_code' | 'currency_symbol'>) => Promise<any>;
      deleteBalanceAdjustment: (id: number) => Promise<any>;

      // Monthly Reports
      getMonthlyReports: () => Promise<MonthlyReport[]>;
      getMonthlyReport: (id: number) => Promise<MonthlyReport | undefined>;
      addMonthlyReport: (report: Omit<MonthlyReport, 'id' | 'created_at'>) => Promise<any>;
      deleteMonthlyReport: (id: number) => Promise<any>;
      getReportData: (startDate: string, endDate: string) => Promise<any>;

      // Manual Exchange Rates
      getManualExchangeRates: () => Promise<ManualExchangeRate[]>;
      getManualExchangeRate: (fromCurrency: string, toCurrency: string) => Promise<ManualExchangeRate | undefined>;
      addManualExchangeRate: (rate: Omit<ManualExchangeRate, 'id' | 'updated_at'>) => Promise<any>;
      updateManualExchangeRate: (id: number, rate: Omit<ManualExchangeRate, 'id' | 'updated_at'>) => Promise<any>;
      deleteManualExchangeRate: (id: number) => Promise<any>;
    };
  }
}

export {};
