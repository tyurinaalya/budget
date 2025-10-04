import { useEffect, useState } from 'react';
import { MonthlyReport, Currency } from '../types';
import ReportGenerator from '../components/ReportGenerator';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

export default function Reports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, currenciesData] = await Promise.all([
        window.electronAPI.getMonthlyReports(),
        window.electronAPI.getCurrencies(),
      ]);
      setReports(reportsData);
      setCurrencies(currenciesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await window.electronAPI.deleteMonthlyReport(id);
      await loadData();
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleViewReport = async (report: MonthlyReport) => {
    setSelectedReport(report);
    setShowGenerator(false);
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
  };

  const handleReportGenerated = () => {
    setShowGenerator(false);
    loadData();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (selectedReport) {
    return <ReportViewer report={selectedReport} onClose={handleCloseReport} />;
  }

  if (showGenerator) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">📊 Generate New Report</h1>
          <button
            onClick={() => setShowGenerator(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Reports
          </button>
        </div>
        <ReportGenerator 
          currencies={currencies}
          onReportGenerated={handleReportGenerated}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📄 Monthly Reports</h1>
          <p className="text-gray-600">Generate and review your financial reports</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Generate New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 rounded-2xl text-center border-2 border-dashed border-blue-300">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h3>
          <p className="text-gray-600 mb-6">Create your first monthly report to track your financial progress</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First Report
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  📋 Report Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  📅 Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  💱 Currency
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  💰 Income
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  💸 Expense
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  📊 Net Change
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  🕐 Generated
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{report.report_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(report.period_start)} - {formatDate(report.period_end)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.report_currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    +{report.total_income.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    -{report.total_expense.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                      report.net_change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {report.net_change >= 0 ? '+' : ''}{report.net_change.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDateTime(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportViewer({ report, onClose }: { report: MonthlyReport; onClose: () => void }) {
  const reportData = JSON.parse(report.report_data);
  const exchangeRates = JSON.parse(report.exchange_rates);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{report.report_name}</h1>
            <div className="flex flex-wrap gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <span className="font-medium">
                  {formatDate(report.period_start)} - {formatDate(report.period_end)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💱</span>
                <span className="font-medium">Currency: {report.report_currency}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕐</span>
                <span className="font-medium">Generated: {formatDateTime(report.created_at)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg"
          >
            ← Back to Reports
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💰</span>
            <p className="text-sm font-semibold text-green-700">Total Income</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            +{report.total_income.toFixed(2)} {report.report_currency}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border-2 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💸</span>
            <p className="text-sm font-semibold text-red-700">Total Expense</p>
          </div>
          <p className="text-3xl font-bold text-red-600">
            -{report.total_expense.toFixed(2)} {report.report_currency}
          </p>
        </div>
        <div className={`bg-gradient-to-br p-6 rounded-xl shadow-lg border-2 ${
          report.net_change >= 0 
            ? 'from-green-50 to-green-100 border-green-200' 
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <p className={`text-sm font-semibold ${report.net_change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Net Change
            </p>
          </div>
          <p className={`text-3xl font-bold ${report.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {report.net_change >= 0 ? '+' : ''}{report.net_change.toFixed(2)} {report.report_currency}
          </p>
        </div>
      </div>

      {/* Income by Category */}
      {reportData.incomeByCategory && reportData.incomeByCategory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Income by Category</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Converted Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.incomeByCategory.map((item: any, idx: number) => {
                // Exchange rates are FROM report_currency TO item currency
                // So to convert FROM item currency TO report_currency, we divide
                let converted;
                if (item.currency_code === report.report_currency) {
                  converted = item.total_amount;
                } else {
                  const rate = exchangeRates[item.currency_code] || 1;
                  converted = item.total_amount / rate;
                }
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.currency_symbol} {item.currency_code}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      {converted.toFixed(2)} {report.report_currency}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.transaction_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses by Currency with Categories */}
      {reportData.expensesByCategory && reportData.expensesByCategory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💸</span>
            <h2 className="text-2xl font-bold text-gray-800">Expenses by Currency</h2>
          </div>
          {(() => {
            // Group expenses by currency
            const expensesByCurrency: { [key: string]: any[] } = {};
            reportData.expensesByCategory.forEach((item: any) => {
              if (!expensesByCurrency[item.currency_code]) {
                expensesByCurrency[item.currency_code] = [];
              }
              expensesByCurrency[item.currency_code].push(item);
            });

            return Object.entries(expensesByCurrency).map(([currencyCode, categories]) => {
              // Calculate currency total
              const currencyTotal = categories.reduce((sum, item) => sum + item.total_amount, 0);
              const currencySymbol = categories[0].currency_symbol;
              
              // Calculate converted total
              let convertedTotal;
              if (currencyCode === report.report_currency) {
                convertedTotal = currencyTotal;
              } else {
                const rate = exchangeRates[currencyCode];
                if (!rate || rate === 1) {
                  // If rate is missing or 1, the currency might not be supported
                  // Try to use the inverse if available
                  console.warn(`Missing or invalid exchange rate for ${currencyCode}. Rate:`, rate);
                  convertedTotal = currencyTotal; // Fallback to showing original amount
                } else {
                  // Rate is FROM report currency TO this currency
                  // To convert FROM this currency TO report currency, divide
                  convertedTotal = currencyTotal / rate;
                }
              }

              return (
                <div key={currencyCode} className="bg-gradient-to-br from-red-50 to-orange-50 shadow-xl rounded-2xl p-6 mb-6 border-2 border-red-200">
                  {/* Currency Header */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 mb-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{currencySymbol}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{currencyCode}</h3>
                          <p className="text-red-100 text-sm">Total Expenses in this Currency</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{currencyTotal.toFixed(2)}</p>
                        {currencyCode !== report.report_currency && (
                          <>
                            {exchangeRates[currencyCode] && exchangeRates[currencyCode] !== 1 ? (
                              <p className="text-red-100 text-sm">≈ {convertedTotal.toFixed(2)} {report.report_currency}</p>
                            ) : (
                              <p className="text-red-100 text-sm text-xs">⚠️ Exchange rate unavailable</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categories Table */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Currency</th>
                          {currencyCode !== report.report_currency && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In {report.report_currency}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {categories.map((item: any, idx: number) => {
                          const percentage = currencyTotal > 0 ? (item.total_amount / currencyTotal * 100) : 0;
                          let converted;
                          if (currencyCode === report.report_currency) {
                            converted = item.total_amount;
                          } else {
                            const rate = exchangeRates[currencyCode] || 1;
                            converted = item.total_amount / rate;
                          }

                          return (
                            <tr key={idx} className="hover:bg-red-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.category}</td>
                              <td className="px-6 py-4 text-lg font-bold text-red-600">
                                {item.total_amount.toFixed(2)} {currencySymbol}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="bg-gray-100 px-3 py-1 rounded-full">{item.transaction_count}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden max-w-[100px]">
                                    <div 
                                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              {currencyCode !== report.report_currency && (
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {exchangeRates[currencyCode] && exchangeRates[currencyCode] !== 1 ? (
                                    <>{converted.toFixed(2)} {report.report_currency}</>
                                  ) : (
                                    <span className="text-xs text-gray-400">Rate unavailable</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Balance Adjustments */}
      {reportData.adjustments && reportData.adjustments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Balance Adjustments</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Old Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.adjustments.map((adjustment: any) => (
                <tr key={adjustment.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(adjustment.date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{adjustment.account_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {adjustment.old_balance.toFixed(2)} {adjustment.currency_symbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {adjustment.new_balance.toFixed(2)} {adjustment.currency_symbol}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    adjustment.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjustment.difference >= 0 ? '+' : ''}{adjustment.difference.toFixed(2)} {adjustment.currency_symbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{adjustment.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Exchange Rates - Moved to Bottom */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl p-8 mt-8 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">💱</span>
          <h2 className="text-2xl font-bold text-gray-800">Exchange Rates</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg">
          <strong>Note:</strong> These rates were captured at report generation time ({formatDateTime(report.created_at)}).
          Each rate shows how much of that currency equals 1 {report.report_currency}.
          <br />
          <span className="text-xs text-amber-600 mt-1 inline-block">
            ⚠️ Cryptocurrency rates (BTC, ETH, etc.) may not be available through the free exchange rate API. 
            Only major fiat currencies are supported.
          </span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(exchangeRates).map(([currency, rate]) => (
            <div key={currency} className="bg-white border-2 border-blue-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500 font-semibold mb-1">1 {report.report_currency} =</p>
              <p className="text-2xl font-bold text-blue-600">{(rate as number).toFixed(6)}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">{currency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
