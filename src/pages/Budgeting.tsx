import React, { useState, useEffect } from 'react';
import { Account, Category, Exchange, BalanceAdjustment } from '../types';
import { ExchangeRateService } from '../services/exchangeRate';
import { formatDate } from '../utils/dateFormatter';

interface BulkTransactionRow {
  id: string;
  date: string;
  type: 'income' | 'expense';
  account_id: string;
  category_id: string;
  amount: string;
  description: string;
}

const Budgeting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bulk');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [balanceAdjustments, setBalanceAdjustments] = useState<BalanceAdjustment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    accountId: '',
    type: '',
  });

  // Exchange rate features
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [convertedBalance, setConvertedBalance] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [ratesAge, setRatesAge] = useState<number>(-1);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  useEffect(() => {
    convertBalances();
    const age = ExchangeRateService.getCacheAge();
    setRatesAge(age);
  }, [accounts, displayCurrency]);

  const convertBalances = async () => {
    if (accounts.length === 0) {
      setConvertedBalance(0);
      return;
    }

    setIsConverting(true);
    try {
      const balances = accounts.map(acc => ({
        amount: acc.balance,
        currency: acc.currency_code || 'USD',
      }));

      const total = await ExchangeRateService.convertBalances(balances, displayCurrency);
      setConvertedBalance(total);
    } catch (error) {
      console.error('Error converting balances:', error);
      // Fall back to simple sum if conversion fails
      setConvertedBalance(accounts.reduce((sum, a) => sum + a.balance, 0));
    } finally {
      setIsConverting(false);
    }
  };

  const handleRefreshRates = async () => {
    setIsConverting(true);
    try {
      await ExchangeRateService.forceRefresh(displayCurrency);
      await convertBalances();
      const age = ExchangeRateService.getCacheAge();
      setRatesAge(age);
      alert('Exchange rates updated successfully!');
    } catch (error) {
      console.error('Error refreshing rates:', error);
      alert('Failed to refresh exchange rates. Using cached rates.');
    } finally {
      setIsConverting(false);
    }
  };

  const loadData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        window.electronAPI.getAccounts(),
        window.electronAPI.getCategories(),
      ]);
      
      setAccounts(accountsData);
      setCategories(categoriesData);

      if (activeTab === 'transactions') {
        const filterObj: any = {};
        if (filters.startDate) filterObj.startDate = filters.startDate;
        if (filters.endDate) filterObj.endDate = filters.endDate;
        if (filters.accountId) filterObj.accountId = parseInt(filters.accountId);
        if (filters.type) filterObj.type = filters.type;
        
        setTransactions(await window.electronAPI.getTransactions(filterObj));
      } else if (activeTab === 'exchanges') {
        setExchanges(await window.electronAPI.getExchanges());
      } else if (activeTab === 'adjustments') {
        setBalanceAdjustments(await window.electronAPI.getBalanceAdjustments());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'adjustments') {
        await window.electronAPI.deleteBalanceAdjustment(id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item.');
    }
  };

  // Get unique currencies from accounts
  const availableCurrencies = Array.from(new Set(accounts.map(a => a.currency_code).filter(Boolean)));
  if (!availableCurrencies.includes('USD')) availableCurrencies.unshift('USD');
  if (!availableCurrencies.includes('EUR')) availableCurrencies.splice(1, 0, 'EUR');

  return (
    <div>
      <div className="page-header">
        <h2>Budgeting</h2>
        <p>Manage your income, expenses, and money exchanges</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Total Balance</h4>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                background: 'white',
              }}
            >
              {availableCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div className="value" style={{ color: '#3498db' }}>
            {isConverting ? (
              <span style={{ fontSize: '16px' }}>Converting...</span>
            ) : (
              <>
                {convertedBalance.toFixed(2)} {displayCurrency}
              </>
            )}
          </div>
          <div className="label">
            {accounts.length} accounts
            {ratesAge >= 0 && (
              <span style={{ fontSize: '10px', marginLeft: '5px', color: '#95a5a6' }}>
                • Rates: {ratesAge === 0 ? 'just now' : `${ratesAge}min ago`}
              </span>
            )}
          </div>
          {ratesAge >= 60 && (
            <button
              onClick={handleRefreshRates}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '11px',
                background: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              disabled={isConverting}
            >
              🔄 Refresh Rates
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1' }}>
          <button
            onClick={() => setActiveTab('bulk')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === 'bulk' ? '#27ae60' : 'transparent',
              color: activeTab === 'bulk' ? 'white' : '#2c3e50',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'bulk' ? 'bold' : 'normal',
            }}
          >
            📊 Bulk Entry
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === 'transactions' ? '#3498db' : 'transparent',
              color: activeTab === 'transactions' ? 'white' : '#2c3e50',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'transactions' ? 'bold' : 'normal',
            }}
          >
            📋 Transactions List
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === 'adjustments' ? '#9b59b6' : 'transparent',
              color: activeTab === 'adjustments' ? 'white' : '#2c3e50',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'adjustments' ? 'bold' : 'normal',
            }}
          >
            💰 Balance Adjustments
          </button>
          <button
            onClick={() => setActiveTab('exchanges')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === 'exchanges' ? '#3498db' : 'transparent',
              color: activeTab === 'exchanges' ? 'white' : '#2c3e50',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'exchanges' ? 'bold' : 'normal',
            }}
          >
            Exchanges
          </button>
        </div>

        {activeTab === 'transactions' && (
          <>
            <div className="filters">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Account</label>
                <select
                  value={filters.accountId}
                  onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}{account.owner ? ` - ${account.owner}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <TransactionsListTable transactions={transactions} />
          </>
        )}

        {activeTab === 'bulk' && (
          <BulkTransactionEntry
            accounts={accounts}
            categories={categories}
            onSave={loadData}
          />
        )}

        {activeTab === 'adjustments' && (
          <BalanceAdjustmentsTable 
            adjustments={balanceAdjustments}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'exchanges' && (
          <ExchangesTable exchanges={exchanges} />
        )}
      </div>
    </div>
  );
};

const TransactionsListTable: React.FC<{
  transactions: any[];
}> = ({ transactions }) => (
  <div>
    <div style={{ marginBottom: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📋 View All Transactions</h4>
      <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
        This is a read-only list. To add transactions, use the <strong>📊 Bulk Entry</strong> tab.
      </p>
    </div>
    {transactions.length === 0 ? (
      <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
        No transactions found for the selected filters
      </p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date)}</td>
              <td>{transaction.account_name}</td>
              <td>{transaction.category_name}</td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: transaction.type === 'income' ? '#27ae60' : '#e74c3c',
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {transaction.type}
                </span>
              </td>
              <td style={{ fontWeight: 'bold', color: transaction.type === 'income' ? '#27ae60' : '#e74c3c' }}>
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.currency_symbol}
                {transaction.amount.toFixed(2)}
              </td>
              <td>{transaction.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const BalanceAdjustmentsTable: React.FC<{
  adjustments: BalanceAdjustment[];
  onDelete: any;
}> = ({ adjustments, onDelete }) => (
  <div>
    <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📝 About Balance Adjustments:</h4>
      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
        Use this to update account balances for investment gains/losses, interest, or corrections
        without creating income/expense transactions. All changes are tracked in history.
      </p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Account</th>
          <th>Old Balance</th>
          <th>New Balance</th>
          <th>Change</th>
          <th>Reason</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {adjustments.map((adj) => (
          <tr key={adj.id}>
            <td>{formatDate(adj.date)}</td>
            <td><strong>{adj.account_name}</strong></td>
            <td style={{ color: '#7f8c8d' }}>
              {adj.currency_symbol}
              {adj.old_balance.toFixed(2)}
            </td>
            <td style={{ fontWeight: 'bold', color: '#3498db' }}>
              {adj.currency_symbol}
              {adj.new_balance.toFixed(2)}
            </td>
            <td style={{ 
              fontWeight: 'bold', 
              color: adj.difference >= 0 ? '#27ae60' : '#e74c3c' 
            }}>
              {adj.difference >= 0 ? '+' : ''}
              {adj.currency_symbol}
              {adj.difference.toFixed(2)}
            </td>
            <td>{adj.reason || '-'}</td>
            <td className="actions">
              <button className="btn btn-danger" onClick={() => onDelete(adj.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {adjustments.length === 0 && (
      <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
        No balance adjustments yet
      </p>
    )}
  </div>
);

const ExchangesTable: React.FC<{ exchanges: Exchange[] }> = ({ exchanges }) => (
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>From Account</th>
        <th>From Amount</th>
        <th>To Account</th>
        <th>To Amount</th>
        <th>Exchange Rate</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {exchanges.map((exchange) => (
        <tr key={exchange.id}>
          <td>{formatDate(exchange.date)}</td>
          <td>{exchange.from_account_name}</td>
          <td>
            -{exchange.from_currency_symbol}
            {exchange.from_amount.toFixed(2)}
          </td>
          <td>{exchange.to_account_name}</td>
          <td>
            +{exchange.to_currency_symbol}
            {exchange.to_amount.toFixed(2)}
          </td>
          <td>{exchange.exchange_rate.toFixed(4)}</td>
          <td>{exchange.description || '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BulkTransactionEntry: React.FC<{
  accounts: Account[];
  categories: Category[];
  onSave: () => void;
}> = ({ accounts, categories, onSave }) => {
  const [rows, setRows] = useState<BulkTransactionRow[]>([
    {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      account_id: '',
      category_id: '',
      amount: '',
      description: '',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now().toString() + Math.random(),
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof BulkTransactionRow, value: string) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const duplicateRow = (id: string) => {
    const rowToDuplicate = rows.find((row) => row.id === id);
    if (rowToDuplicate) {
      const newRow = {
        ...rowToDuplicate,
        id: Date.now().toString() + Math.random(),
      };
      const index = rows.findIndex((row) => row.id === id);
      const newRows = [...rows];
      newRows.splice(index + 1, 0, newRow);
      setRows(newRows);
    }
  };

  const getFilteredCategories = (type: string) => {
    return categories.filter((c: Category) => c.type === type);
  };

  const validateAndSave = async () => {
    const validRows = rows.filter(
      (row) =>
        row.date &&
        row.account_id &&
        row.category_id &&
        row.amount &&
        parseFloat(row.amount) > 0
    );

    if (validRows.length === 0) {
      alert('Please fill in at least one complete transaction (Date, Account, Category, and Amount are required).');
      return;
    }

    if (validRows.length !== rows.length) {
      if (
        !confirm(
          `${rows.length - validRows.length} incomplete row(s) will be skipped. Continue with ${validRows.length} transaction(s)?`
        )
      ) {
        return;
      }
    }

    setIsSaving(true);
    try {
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
      alert(`Successfully saved ${validRows.length} transaction(s)!`);
      // Reset to one empty row
      setRows([
        {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          account_id: '',
          category_id: '',
          amount: '',
          description: '',
        },
      ]);
      onSave();
    } catch (error) {
      console.error('Error saving bulk transactions:', error);
      alert('Error saving transactions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={addRow}
          style={{ background: '#27ae60' }}
        >
          ➕ Add Row
        </button>
        <button
          className="btn btn-primary"
          onClick={validateAndSave}
          disabled={isSaving}
          style={{ background: '#3498db', minWidth: '150px' }}
        >
          {isSaving ? 'Saving...' : `💾 Save All (${rows.length})`}
        </button>
        <span style={{ color: '#7f8c8d', fontSize: '13px' }}>
          💡 Tip: Fill multiple rows and save them all at once. Use Tab key to navigate.
        </span>
      </div>

      <table style={{ width: '100%', minWidth: '1200px' }}>
        <thead>
          <tr style={{ background: '#ecf0f1' }}>
            <th style={{ padding: '12px 8px', width: '40px' }}>#</th>
            <th style={{ padding: '12px 8px', width: '140px' }}>Date</th>
            <th style={{ padding: '12px 8px', width: '120px' }}>Type</th>
            <th style={{ padding: '12px 8px', width: '200px' }}>Account</th>
            <th style={{ padding: '12px 8px', width: '200px' }}>Category</th>
            <th style={{ padding: '12px 8px', width: '120px' }}>Amount</th>
            <th style={{ padding: '12px 8px', flex: 1 }}>Description</th>
            <th style={{ padding: '12px 8px', width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const filteredCats = getFilteredCategories(row.type);
            return (
              <tr key={row.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '8px', textAlign: 'center', color: '#95a5a6' }}>
                  {index + 1}
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <select
                    value={row.type}
                    onChange={(e) => {
                      updateRow(row.id, 'type', e.target.value);
                      updateRow(row.id, 'category_id', ''); // Reset category when type changes
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: row.type === 'income' ? '#d5f4e6' : '#fadbd8',
                    }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </td>
                <td style={{ padding: '4px' }}>
                  <select
                    value={row.account_id}
                    onChange={(e) => updateRow(row.id, 'account_id', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}{account.owner ? ` - ${account.owner}` : ''} ({account.currency_code})
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '4px' }}>
                  <select
                    value={row.category_id}
                    onChange={(e) => updateRow(row.id, 'category_id', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                    disabled={!row.type}
                  >
                    <option value="">Select Category</option>
                    {filteredCats.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                    placeholder="Optional description..."
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  />
                </td>
                <td style={{ padding: '4px', textAlign: 'center' }}>
                  <button
                    onClick={() => duplicateRow(row.id)}
                    title="Duplicate this row"
                    style={{
                      padding: '6px 10px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginRight: '4px',
                    }}
                  >
                    📋
                  </button>
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    title="Remove this row"
                    style={{
                      padding: '6px 10px',
                      background: rows.length === 1 ? '#bdc3c7' : '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📝 Quick Guide:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '13px' }}>
          <li>Use <strong>Tab</strong> key to quickly move between fields</li>
          <li>Click <strong>📋 Duplicate</strong> to copy a row with all its values</li>
          <li>Click <strong>➕ Add Row</strong> to add more transactions</li>
          <li>Only complete rows (with Date, Account, Category, and Amount) will be saved</li>
          <li>All transactions will be saved at once when you click <strong>💾 Save All</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Budgeting;
