import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExchangeRateService } from '../services/exchangeRate';

const Analytics: React.FC = () => {
  const [balanceByCountry, setBalanceByCountry] = useState<any[]>([]);
  const [balanceByCurrency, setBalanceByCurrency] = useState<any[]>([]);
  const [balanceByAssetType, setBalanceByAssetType] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [convertedTotal, setConvertedTotal] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedOwner]);

  useEffect(() => {
    convertTotal();
  }, [balanceByCurrency, displayCurrency]);

  const loadOwners = async () => {
    try {
      const ownersData = await window.electronAPI.getUniqueOwners();
      setOwners(ownersData.map((item: any) => item.owner));
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const loadData = async () => {
    try {
      const owner = selectedOwner === 'all' ? undefined : selectedOwner;
      const [countryData, currencyData, assetTypeData, accountsData, expensesData] = await Promise.all([
        window.electronAPI.getBalanceByCountry(owner),
        window.electronAPI.getBalanceByCurrency(owner),
        window.electronAPI.getBalanceByAssetType(owner),
        window.electronAPI.getAccountsByOwner(owner),
        window.electronAPI.getExpensesByCategory(dateRange.startDate, dateRange.endDate),
      ]);

      setBalanceByCountry(countryData);
      setBalanceByCurrency(currencyData);
      setBalanceByAssetType(assetTypeData);
      setAccounts(accountsData);
      setExpensesByCategory(expensesData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const convertTotal = async () => {
    if (balanceByCurrency.length === 0) {
      setConvertedTotal(0);
      return;
    }

    setIsConverting(true);
    try {
      const balances = balanceByCurrency.map(item => ({
        amount: item.total_balance,
        currency: item.currency_code,
      }));

      const total = await ExchangeRateService.convertBalances(balances, displayCurrency);
      setConvertedTotal(total);
    } catch (error) {
      console.error('Error converting total:', error);
      setConvertedTotal(balanceByCurrency.reduce((sum, item) => sum + item.total_balance, 0));
    } finally {
      setIsConverting(false);
    }
  };

  const COLORS = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  // Get unique currencies
  const availableCurrencies = Array.from(new Set(balanceByCurrency.map(item => item.currency_code)));
  if (!availableCurrencies.includes('USD')) availableCurrencies.unshift('USD');
  if (!availableCurrencies.includes('EUR') && availableCurrencies.length > 0) availableCurrencies.splice(1, 0, 'EUR');

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Visualize your financial data across countries and currencies</p>
      </div>

      {/* Owner Filter */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>Filter by Owner:</label>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: 'white',
              minWidth: '200px',
            }}
          >
            <option value="all">All Owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <span style={{ color: '#7f8c8d', fontSize: '13px' }}>
            {selectedOwner === 'all' 
              ? '📊 Showing data for all accounts' 
              : `👤 Showing data for ${selectedOwner}'s accounts`}
          </span>
        </div>
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
            {isConverting ? 'Converting...' : `${convertedTotal.toFixed(2)} ${displayCurrency}`}
          </div>
          <div className="label">Converted from all currencies</div>
        </div>
        <div className="stat-card">
          <h4>Countries</h4>
          <div className="value" style={{ color: '#27ae60' }}>
            {balanceByCountry.length}
          </div>
          <div className="label">Active countries</div>
        </div>
        <div className="stat-card">
          <h4>Currencies</h4>
          <div className="value" style={{ color: '#e74c3c' }}>
            {balanceByCurrency.length}
          </div>
          <div className="label">Active currencies</div>
        </div>
        <div className="stat-card">
          <h4>Expense Categories</h4>
          <div className="value" style={{ color: '#f39c12' }}>
            {expensesByCategory.length}
          </div>
          <div className="label">This period</div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="card">
        <h3>💼 All Accounts</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Owner</th>
                <th>Country</th>
                <th>Asset Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td><strong>{account.name}</strong></td>
                  <td>{account.owner || <span style={{ color: '#95a5a6' }}>-</span>}</td>
                  <td>{account.country_name}</td>
                  <td>{account.asset_type_name}</td>
                  <td style={{ fontWeight: 'bold', color: '#3498db' }}>
                    {account.currency_symbol}
                    {account.balance.toFixed(2)} {account.currency_code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>
            No accounts found
          </p>
        )}
      </div>

      {/* Balance by Asset Type */}
      <div className="card">
        <h3>🏦 Balance by Asset Type</h3>
        <div style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Asset Type</th>
                <th>Total Balance</th>
                <th>Accounts</th>
                <th>Currencies</th>
              </tr>
            </thead>
            <tbody>
              {balanceByAssetType.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.asset_type}</strong></td>
                  <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                    {item.total_balance.toFixed(2)}
                  </td>
                  <td>{item.account_count}</td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {item.currencies}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {balanceByAssetType.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={balanceByAssetType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="asset_type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_balance" fill="#27ae60" name="Balance" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {balanceByAssetType.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>
            No asset types found
          </p>
        )}
      </div>

      <div className="card">
        <h3>Balance by Country</h3>
        <div style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Currency</th>
                <th>Total Balance</th>
                <th>Accounts</th>
              </tr>
            </thead>
            <tbody>
              {balanceByCountry.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.country}</strong> ({item.code})
                  </td>
                  <td>{item.currency_code}</td>
                  <td style={{ fontWeight: 'bold', color: '#3498db' }}>
                    {item.currency_symbol}
                    {item.total_balance.toFixed(2)}
                  </td>
                  <td>{item.account_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {balanceByCountry.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={balanceByCountry}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_balance" fill="#3498db" name="Balance" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Balance by Currency</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Total Balance</th>
                  <th>Accounts</th>
                </tr>
              </thead>
              <tbody>
                {balanceByCurrency.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{item.currency}</strong> ({item.code})
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#3498db' }}>
                      {item.symbol}
                      {item.total_balance.toFixed(2)}
                    </td>
                    <td>{item.account_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {balanceByCurrency.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={balanceByCurrency}
                  dataKey="total_balance"
                  nameKey="currency"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.code}: ${entry.symbol}${entry.total_balance.toFixed(0)}`}
                >
                  {balanceByCurrency.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Expenses by Category</h3>
        <div style={{ marginBottom: '20px' }}>
          <div className="filters">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {expensesByCategory.length > 0 ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Amount</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.category}</strong></td>
                      <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                        {item.currency_symbol}
                        {item.total_amount.toFixed(2)}
                      </td>
                      <td>{item.transaction_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_amount" fill="#e74c3c" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
            No expenses found for this period
          </p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
