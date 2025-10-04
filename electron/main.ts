import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { DatabaseService } from './database/database';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // Wait a bit for Vite to start, then load
    setTimeout(() => {
      mainWindow?.loadURL('http://localhost:5173').catch(() => {
        // Try alternate port if 5173 fails
        mainWindow?.loadURL('http://localhost:5174').catch(() => {
          console.error('Could not connect to Vite dev server on ports 5173 or 5174');
        });
      });
      mainWindow?.webContents.openDevTools();
    }, 1000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  const userDataPath = app.getPath('userData');
  dbService = new DatabaseService(userDataPath);
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dbService.close();
    app.quit();
  }
});

function setupIpcHandlers() {
  // Countries
  ipcMain.handle('get-countries', () => dbService.getCountries());
  ipcMain.handle('add-country', (_, country) => dbService.addCountry(country));
  ipcMain.handle('update-country', (_, id, country) => dbService.updateCountry(id, country));
  ipcMain.handle('delete-country', (_, id) => dbService.deleteCountry(id));

  // Currencies
  ipcMain.handle('get-currencies', () => dbService.getCurrencies());
  ipcMain.handle('add-currency', (_, currency) => dbService.addCurrency(currency));
  ipcMain.handle('update-currency', (_, id, currency) => dbService.updateCurrency(id, currency));
  ipcMain.handle('delete-currency', (_, id) => dbService.deleteCurrency(id));

  // Accounts
  ipcMain.handle('get-accounts', () => dbService.getAccounts());
  ipcMain.handle('add-account', (_, account) => dbService.addAccount(account));
  ipcMain.handle('update-account', (_, id, account) => dbService.updateAccount(id, account));
  ipcMain.handle('delete-account', (_, id) => dbService.deleteAccount(id));

  // Categories
  ipcMain.handle('get-categories', () => dbService.getCategories());
  ipcMain.handle('add-category', (_, category) => dbService.addCategory(category));
  ipcMain.handle('update-category', (_, id, category) => dbService.updateCategory(id, category));
  ipcMain.handle('delete-category', (_, id) => dbService.deleteCategory(id));

  // Asset Types
  ipcMain.handle('get-asset-types', () => dbService.getAssetTypes());
  ipcMain.handle('add-asset-type', (_, assetType) => dbService.addAssetType(assetType));
  ipcMain.handle('update-asset-type', (_, id, assetType) => dbService.updateAssetType(id, assetType));
  ipcMain.handle('delete-asset-type', (_, id) => dbService.deleteAssetType(id));

  // Transactions
  ipcMain.handle('get-transactions', (_, filters) => dbService.getTransactions(filters));
  ipcMain.handle('add-transaction', (_, transaction) => dbService.addTransaction(transaction));
  ipcMain.handle('update-transaction', (_, id, transaction) => dbService.updateTransaction(id, transaction));
  ipcMain.handle('delete-transaction', (_, id) => dbService.deleteTransaction(id));

  // Exchanges
  ipcMain.handle('get-exchanges', () => dbService.getExchanges());
  ipcMain.handle('add-exchange', (_, exchange) => dbService.addExchange(exchange));

  // Analytics
  ipcMain.handle('get-balance-by-country', (_, owner) => dbService.getBalanceByCountry(owner));
  ipcMain.handle('get-balance-by-currency', (_, owner) => dbService.getBalanceByCurrency(owner));
  ipcMain.handle('get-balance-by-asset-type', (_, owner) => dbService.getBalanceByAssetType(owner));
  ipcMain.handle('get-accounts-by-owner', (_, owner) => dbService.getAccountsByOwner(owner));
  ipcMain.handle('get-unique-owners', () => dbService.getUniqueOwners());
  ipcMain.handle('get-expenses-by-category', (_, startDate, endDate) => 
    dbService.getExpensesByCategory(startDate, endDate));

  // Balance Adjustments
  ipcMain.handle('get-balance-adjustments', (_, accountId) => dbService.getBalanceAdjustments(accountId));
  ipcMain.handle('add-balance-adjustment', (_, adjustment) => dbService.addBalanceAdjustment(adjustment));
  ipcMain.handle('delete-balance-adjustment', (_, id) => dbService.deleteBalanceAdjustment(id));

  // Monthly Reports
  ipcMain.handle('get-monthly-reports', () => dbService.getMonthlyReports());
  ipcMain.handle('get-monthly-report', (_, id) => dbService.getMonthlyReport(id));
  ipcMain.handle('add-monthly-report', (_, report) => dbService.addMonthlyReport(report));
  ipcMain.handle('delete-monthly-report', (_, id) => dbService.deleteMonthlyReport(id));
  ipcMain.handle('get-report-data', (_, startDate, endDate) => dbService.getReportData(startDate, endDate));

  // Manual Exchange Rates
  ipcMain.handle('get-manual-exchange-rates', () => dbService.getManualExchangeRates());
  ipcMain.handle('get-manual-exchange-rate', (_, fromCurrency, toCurrency) => dbService.getManualExchangeRate(fromCurrency, toCurrency));
  ipcMain.handle('add-manual-exchange-rate', (_, rate) => dbService.addManualExchangeRate(rate));
  ipcMain.handle('update-manual-exchange-rate', (_, id, rate) => dbService.updateManualExchangeRate(id, rate));
  ipcMain.handle('delete-manual-exchange-rate', (_, id) => dbService.deleteManualExchangeRate(id));
}
