import { useState, useEffect } from 'react';
import { Currency } from '../types';
import { ExchangeRateService } from '../services/exchangeRate';
import { formatDate } from '../utils/dateFormatter';

interface ReportGeneratorProps {
  currencies: Currency[];
  onReportGenerated: () => void;
}

export default function ReportGenerator({ currencies, onReportGenerated }: ReportGeneratorProps) {
  const [reportName, setReportName] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [reportCurrency, setReportCurrency] = useState('USD');
  const [generating, setGenerating] = useState(false);

  // Auto-generate report name when dates change
  useEffect(() => {
    if (periodStart && periodEnd) {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      const name = `${formatDate(start)} - ${formatDate(end)}`;
      setReportName(name);
    }
  }, [periodStart, periodEnd]);

  const handleGenerateReport = async () => {
    if (!reportName || !periodStart || !periodEnd || !reportCurrency) {
      alert('Please fill in all fields');
      return;
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
      alert('Start date must be before end date');
      return;
    }

    setGenerating(true);
    try {
      // Get report data from the database
      const reportData = await window.electronAPI.getReportData(periodStart, periodEnd);
      
      // Get current exchange rates from API
      const ratesData = await ExchangeRateService.getRates(reportCurrency);
      const allRates = ratesData.rates;
      
      // Get manual exchange rates from database
      const manualRatesData = await window.electronAPI.getManualExchangeRates();
      
      // Collect currencies from accounts (not just from transactions in this period)
      const accountCurrencies = new Set<string>();
      accountCurrencies.add(reportCurrency); // Always include the report currency
      
      // Add all currencies used in accounts
      reportData.accountCurrencies.forEach((item: any) => {
        accountCurrencies.add(item.currency_code);
      });
      
      // Filter rates to only include currencies used in accounts
      // Fallback to manual rates if API doesn't have it
      const rates: { [key: string]: number } = {};
      accountCurrencies.forEach(currency => {
        if (allRates[currency] !== undefined) {
          // Use API rate
          rates[currency] = allRates[currency];
        } else if (currency === reportCurrency) {
          // Report currency to itself is always 1
          rates[currency] = 1;
        } else {
          // Try to find a manual rate
          const manualRate = manualRatesData.find((r: any) => 
            r.from_currency === reportCurrency && r.to_currency === currency
          );
          if (manualRate) {
            rates[currency] = manualRate.rate;
            console.log(`Using manual exchange rate for ${currency}: ${manualRate.rate}`);
          }
        }
      });
      
      // Calculate totals in the selected currency
      let totalIncome = 0;
      let totalExpense = 0;

      // Sum income by category with currency conversion
      // Note: rates are FROM report_currency TO other currency
      // So to convert FROM other currency TO report_currency, we divide
      reportData.incomeByCategory.forEach((item: any) => {
        if (item.currency_code === reportCurrency) {
          totalIncome += item.total_amount;
        } else {
          const rate = rates[item.currency_code] || 1;
          totalIncome += item.total_amount / rate;
        }
      });

      // Sum expenses by category with currency conversion
      reportData.expensesByCategory.forEach((item: any) => {
        if (item.currency_code === reportCurrency) {
          totalExpense += item.total_amount;
        } else {
          const rate = rates[item.currency_code] || 1;
          totalExpense += item.total_amount / rate;
        }
      });

      const netChange = totalIncome - totalExpense;

      // Save the report
      await window.electronAPI.addMonthlyReport({
        report_name: reportName,
        period_start: periodStart,
        period_end: periodEnd,
        report_currency: reportCurrency,
        exchange_rates: JSON.stringify(rates), // Only currencies used in this report
        report_data: JSON.stringify(reportData),
        total_income: totalIncome,
        total_expense: totalExpense,
        net_change: netChange,
      });

      alert('Report generated successfully!');
      
      // Reset form
      setReportName('');
      setPeriodStart('');
      setPeriodEnd('');
      
      onReportGenerated();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Generate Monthly Report</h2>
      
      <div className="space-y-6">
        {/* Period Dates - Full Width */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Period Start
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {periodStart && (
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(periodStart)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Period End
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {periodEnd && (
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(periodEnd)}
              </p>
            )}
          </div>
        </div>

        {/* Report Name - Full Width */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Report Name
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Auto-generated from dates"
          />
          <p className="mt-1 text-xs text-gray-500">
            ✨ Automatically filled based on selected period
          </p>
        </div>

        {/* Report Currency */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Report Currency
          </label>
          <select
            value={reportCurrency}
            onChange={(e) => setReportCurrency(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleGenerateReport}
          disabled={generating || !periodStart || !periodEnd || !reportName}
          className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-all ${
            generating || !periodStart || !periodEnd || !reportName
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
          }`}
        >
          {generating ? '⏳ Generating...' : '✅ Generate Report'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>📊 Note:</strong> The report will include all income and expenses within the selected period, 
          grouped by category. Exchange rates for <strong>all currencies in your accounts</strong> will be captured 
          at the time of report generation, and all amounts will be converted to the selected currency.
        </p>
      </div>
    </div>
  );
}
