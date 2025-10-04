// Exchange Rate Service
// Uses exchangerate-api.com free tier (1500 requests/month)

export interface ExchangeRates {
  base: string;
  rates: { [currency: string]: number };
  timestamp: number;
}

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const API_URL = 'https://api.exchangerate-api.com/v4/latest';

export class ExchangeRateService {
  private static cache: ExchangeRates | null = null;
  private static lastFetch: number = 0;

  /**
   * Get exchange rates with caching
   * Manual rates are ALWAYS preferred over API rates
   * @param baseCurrency Base currency (default: USD)
   */
  static async getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Check cache first
    if (this.cache && this.cache.base === baseCurrency && (now - this.lastFetch) < CACHE_DURATION) {
      return this.cache;
    }

    // Try to load from localStorage
    const cached = this.loadFromLocalStorage(baseCurrency);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      this.cache = cached;
      this.lastFetch = cached.timestamp;
      return cached;
    }

    // Fetch fresh rates
    try {
      const response = await fetch(`${API_URL}/${baseCurrency}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates: ExchangeRates = {
        base: data.base,
        rates: data.rates,
        timestamp: now,
      };

      // Merge with manual exchange rates - MANUAL RATES OVERRIDE API RATES
      await this.mergeManualRates(rates, baseCurrency);

      this.cache = rates;
      this.lastFetch = now;
      this.saveToLocalStorage(rates);

      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return cached data even if expired, or throw
      if (cached) {
        console.warn('Using expired exchange rate cache');
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Merge manual exchange rates into the rates object
   * Manual rates ALWAYS override API rates for the same currency pairs
   * This gives user-defined rates absolute priority
   */
  private static async mergeManualRates(rates: ExchangeRates, baseCurrency: string): Promise<void> {
    try {
      const manualRates = await window.electronAPI.getManualExchangeRates();
      let manualRatesApplied = 0;
      
      manualRates.forEach((manualRate: any) => {
        const updateAge = this.getUpdateAge(manualRate.updated_at);
        const isCurrent = updateAge < 24; // Consider rates updated within 24 hours as current
        const ageLabel = isCurrent ? '🟢 CURRENT' : `🟡 ${updateAge.toFixed(0)}h old`;
        
        // If this manual rate is FROM the base currency (e.g., base=USD, manual=USD→BTC)
        if (manualRate.from_currency === baseCurrency) {
          rates.rates[manualRate.to_currency] = manualRate.rate;
          console.log(`✅ Manual rate OVERRIDES API: ${baseCurrency} → ${manualRate.to_currency} = ${manualRate.rate} (${ageLabel})`);
          manualRatesApplied++;
        }
        // If this manual rate is TO the base currency (e.g., base=USD, manual=BTC→USD)
        // We need to store the inverse: if BTC→USD=122000, then for base USD, we store USD→BTC=1/122000
        else if (manualRate.to_currency === baseCurrency) {
          rates.rates[manualRate.from_currency] = 1 / manualRate.rate;
          console.log(`✅ Manual rate OVERRIDES API: ${baseCurrency} → ${manualRate.from_currency} = ${1 / manualRate.rate} (inverted from ${manualRate.from_currency}→${baseCurrency}=${manualRate.rate}) (${ageLabel})`);
          manualRatesApplied++;
        }
      });
      
      if (manualRatesApplied > 0) {
        console.log(`📊 Total manual rates applied: ${manualRatesApplied}`);
      }
    } catch (error) {
      console.error('Error loading manual exchange rates:', error);
    }
  }

  /**
   * Calculate how many hours ago a timestamp was updated
   */
  private static getUpdateAge(updatedAt: string): number {
    try {
      const updated = new Date(updatedAt).getTime();
      const now = Date.now();
      return (now - updated) / (1000 * 60 * 60); // Convert to hours
    } catch {
      return Infinity; // If can't parse, treat as very old
    }
  }

  /**
   * Convert amount from one currency to another
   * Intelligently handles manual rates in either direction
   */
  static async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      // First, check if there's a direct manual rate for this conversion
      const directRate = await this.getManualRate(fromCurrency, toCurrency);
      if (directRate !== null) {
        console.log(`Using direct manual rate: ${fromCurrency} → ${toCurrency} = ${directRate}`);
        return amount * directRate;
      }

      // Try to get rates FROM the source currency (API + merged manual rates)
      let rates = await this.getRates(fromCurrency);
      let rate = rates.rates[toCurrency];
      
      if (!rate || rate === 1) {
        // If not found or is 1:1, try getting rates FROM the target currency and invert
        console.log(`Rate not found for ${fromCurrency} → ${toCurrency}, trying inverse`);
        rates = await this.getRates(toCurrency);
        const inverseRate = rates.rates[fromCurrency];
        
        if (inverseRate && inverseRate !== 1) {
          rate = 1 / inverseRate;
          console.log(`Using inverted rate: ${fromCurrency} → ${toCurrency} (rate: ${rate})`);
        } else {
          console.warn(`Exchange rate not found for ${fromCurrency} → ${toCurrency}, using 1:1`);
          return amount;
        }
      }

      console.log(`Converting ${amount} ${fromCurrency} → ${toCurrency} (rate: ${rate}) = ${amount * rate}`);
      return amount * rate;
    } catch (error) {
      console.error(`Conversion error (${fromCurrency} → ${toCurrency}):`, error);
      return amount; // Return original amount on error
    }
  }

  /**
   * Get manual exchange rate directly from database
   * Checks both directions: FROM→TO and TO→FROM (inverted)
   * Manual rates have ABSOLUTE PRIORITY over API rates
   */
  private static async getManualRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    try {
      const manualRates = await window.electronAPI.getManualExchangeRates();
      
      // Check for direct rate: FROM → TO
      const directRate = manualRates.find((r: any) => 
        r.from_currency === fromCurrency && r.to_currency === toCurrency
      );
      if (directRate) {
        const updateAge = this.getUpdateAge(directRate.updated_at);
        const isCurrent = updateAge < 24;
        const ageLabel = isCurrent ? '🟢 CURRENT' : `🟡 ${updateAge.toFixed(0)}h old`;
        console.log(`🎯 PRIORITY: Direct manual rate used: ${fromCurrency} → ${toCurrency} = ${directRate.rate} (${ageLabel})`);
        return directRate.rate;
      }

      // Check for inverse rate: TO → FROM (need to invert)
      const inverseRate = manualRates.find((r: any) => 
        r.from_currency === toCurrency && r.to_currency === fromCurrency
      );
      if (inverseRate) {
        const inverted = 1 / inverseRate.rate;
        const updateAge = this.getUpdateAge(inverseRate.updated_at);
        const isCurrent = updateAge < 24;
        const ageLabel = isCurrent ? '🟢 CURRENT' : `🟡 ${updateAge.toFixed(0)}h old`;
        console.log(`🎯 PRIORITY: Inverse manual rate used: ${toCurrency} → ${fromCurrency} = ${inverseRate.rate}, inverted to ${fromCurrency} → ${toCurrency} = ${inverted} (${ageLabel})`);
        return inverted;
      }

      return null; // No manual rate found
    } catch (error) {
      console.error('Error getting manual rate:', error);
      return null;
    }
  }

  /**
   * Get current exchange rate between two currencies
   * Intelligently handles manual rates in either direction
   */
  static async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    try {
      // First check for direct manual rate
      const manualRate = await this.getManualRate(fromCurrency, toCurrency);
      if (manualRate !== null) {
        return manualRate;
      }

      // Fallback to API rates
      const rates = await this.getRates(fromCurrency);
      const rate = rates.rates[toCurrency];
      
      if (!rate || rate === 1) {
        // Try inverse
        const inverseRates = await this.getRates(toCurrency);
        const inverseRate = inverseRates.rates[fromCurrency];
        if (inverseRate && inverseRate !== 1) {
          return 1 / inverseRate;
        }
      }
      
      return rate || 1;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 1;
    }
  }

  /**
   * Convert multiple balances to a target currency
   */
  static async convertBalances(
    balances: Array<{ amount: number; currency: string }>,
    targetCurrency: string
  ): Promise<number> {
    let total = 0;

    for (const balance of balances) {
      const converted = await this.convert(balance.amount, balance.currency, targetCurrency);
      total += converted;
    }

    return total;
  }

  /**
   * Force refresh rates from API
   */
  static async forceRefresh(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    this.cache = null;
    this.lastFetch = 0;
    localStorage.removeItem(CACHE_KEY);
    return this.getRates(baseCurrency);
  }

  /**
   * Get cached rates age in minutes
   */
  static getCacheAge(): number {
    if (!this.lastFetch) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        return Math.floor((Date.now() - data.timestamp) / 60000);
      }
      return -1;
    }
    return Math.floor((Date.now() - this.lastFetch) / 60000);
  }

  /**
   * Check if rates are available (cached or online)
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await this.getRates('USD');
      return true;
    } catch {
      return false;
    }
  }

  // Private helpers
  private static saveToLocalStorage(rates: ExchangeRates): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    } catch (error) {
      console.error('Failed to save exchange rates to localStorage:', error);
    }
  }

  private static loadFromLocalStorage(baseCurrency: string): ExchangeRates | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      if (data.base === baseCurrency) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load exchange rates from localStorage:', error);
      return null;
    }
  }
}
