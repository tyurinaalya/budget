import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Countries
  getCountries: () => ipcRenderer.invoke('get-countries'),
  addCountry: (country: any) => ipcRenderer.invoke('add-country', country),
  updateCountry: (id: number, country: any) => ipcRenderer.invoke('update-country', id, country),
  deleteCountry: (id: number) => ipcRenderer.invoke('delete-country', id),

  // Currencies
  getCurrencies: () => ipcRenderer.invoke('get-currencies'),
  addCurrency: (currency: any) => ipcRenderer.invoke('add-currency', currency),
  updateCurrency: (id: number, currency: any) => ipcRenderer.invoke('update-currency', id, currency),
  deleteCurrency: (id: number) => ipcRenderer.invoke('delete-currency', id),

  // Accounts
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account: any) => ipcRenderer.invoke('add-account', account),
  updateAccount: (id: number, account: any) => ipcRenderer.invoke('update-account', id, account),
  deleteAccount: (id: number) => ipcRenderer.invoke('delete-account', id),

  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category: any) => ipcRenderer.invoke('add-category', category),
  updateCategory: (id: number, category: any) => ipcRenderer.invoke('update-category', id, category),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),

  // Asset Types
  getAssetTypes: () => ipcRenderer.invoke('get-asset-types'),
  addAssetType: (assetType: any) => ipcRenderer.invoke('add-asset-type', assetType),
  updateAssetType: (id: number, assetType: any) => ipcRenderer.invoke('update-asset-type', id, assetType),
  deleteAssetType: (id: number) => ipcRenderer.invoke('delete-asset-type', id),

  // Transactions
  getTransactions: (filters?: any) => ipcRenderer.invoke('get-transactions', filters),
  addTransaction: (transaction: any) => ipcRenderer.invoke('add-transaction', transaction),
  updateTransaction: (id: number, transaction: any) => ipcRenderer.invoke('update-transaction', id, transaction),
  deleteTransaction: (id: number) => ipcRenderer.invoke('delete-transaction', id),

  // Exchanges
  getExchanges: () => ipcRenderer.invoke('get-exchanges'),
  addExchange: (exchange: any) => ipcRenderer.invoke('add-exchange', exchange),

  // Analytics
  getBalanceByCountry: (owner?: string) => ipcRenderer.invoke('get-balance-by-country', owner),
  getBalanceByCurrency: (owner?: string) => ipcRenderer.invoke('get-balance-by-currency', owner),
  getBalanceByAssetType: (owner?: string) => ipcRenderer.invoke('get-balance-by-asset-type', owner),
  getAccountsByOwner: (owner?: string) => ipcRenderer.invoke('get-accounts-by-owner', owner),
  getUniqueOwners: () => ipcRenderer.invoke('get-unique-owners'),
  getExpensesByCategory: (startDate: string, endDate: string) => 
    ipcRenderer.invoke('get-expenses-by-category', startDate, endDate),

  // Balance Adjustments
  getBalanceAdjustments: (accountId?: number) => ipcRenderer.invoke('get-balance-adjustments', accountId),
  addBalanceAdjustment: (adjustment: any) => ipcRenderer.invoke('add-balance-adjustment', adjustment),
  deleteBalanceAdjustment: (id: number) => ipcRenderer.invoke('delete-balance-adjustment', id),

  // Monthly Reports
  getMonthlyReports: () => ipcRenderer.invoke('get-monthly-reports'),
  getMonthlyReport: (id: number) => ipcRenderer.invoke('get-monthly-report', id),
  addMonthlyReport: (report: any) => ipcRenderer.invoke('add-monthly-report', report),
  deleteMonthlyReport: (id: number) => ipcRenderer.invoke('delete-monthly-report', id),
  getReportData: (startDate: string, endDate: string) => ipcRenderer.invoke('get-report-data', startDate, endDate),

  // Manual Exchange Rates
  getManualExchangeRates: () => ipcRenderer.invoke('get-manual-exchange-rates'),
  getManualExchangeRate: (fromCurrency: string, toCurrency: string) => ipcRenderer.invoke('get-manual-exchange-rate', fromCurrency, toCurrency),
  addManualExchangeRate: (rate: any) => ipcRenderer.invoke('add-manual-exchange-rate', rate),
  updateManualExchangeRate: (id: number, rate: any) => ipcRenderer.invoke('update-manual-exchange-rate', id, rate),
  deleteManualExchangeRate: (id: number) => ipcRenderer.invoke('delete-manual-exchange-rate', id),
});
