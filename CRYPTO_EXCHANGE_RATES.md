# Cryptocurrency Exchange Rates

## Issue with BTC and Other Cryptocurrencies

### Problem
The current exchange rate API (exchangerate-api.com free tier) **does not support cryptocurrency rates** like BTC, ETH, USDT, USDC, etc. This means:
- When generating reports with USD as the report currency, BTC amounts cannot be converted
- The UI will show "Exchange rate unavailable" messages
- Only major fiat currencies (USD, EUR, GBP, RSD, TRY, RUB, etc.) are supported

### Current Behavior
When you have BTC expenses and generate a report in USD:
- The BTC amount is displayed correctly (e.g., 0.04 BTC)
- Conversion shows: "⚠️ Exchange rate unavailable" 
- In the exchange rates section, there's a warning about crypto support

### Why This Happens
The free exchangerate-api.com API returns rates like:
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "RSD": 99.76,
    // ... other fiat currencies
    // BTC is NOT included in free tier
  }
}
```

## Solutions

### ✅ Option 1: Manual Exchange Rates (IMPLEMENTED in v1.10)
**Now available!** Add custom exchange rates directly in the app:

1. Go to **Admin Panel → Exchange Rates** tab
2. Click "Add Custom"
3. Fill in the form:
   - **From Currency**: e.g., USD
   - **To Currency**: e.g., BTC
   - **Rate**: e.g., 0.000011 (means 1 USD = 0.000011 BTC)
   - **Description**: Optional note (e.g., "Rate from CoinMarketCap 2025-10-04")
4. Click Save

**How it works:**
- Manual rates are stored in the database
- When generating reports, the system first tries the API
- If no API rate exists, it automatically uses your manual rate
- Supports up to 8 decimal places for precision

**Example:**
```
From: USD
To: BTC
Rate: 0.000011
Description: $88,000 per BTC (1/88000 = 0.000011)
```

Now when you generate a report with USD as the report currency, your BTC expenses will be converted using this rate!

### Option 2: Use Multiple Report Currencies
Generate separate reports for different currency groups:
- Generate a report in **USD** for all USD/fiat transactions
- Generate a separate report in **BTC** for all cryptocurrency transactions

### Option 3: Manual Conversion (if needed)
1. Note the BTC amounts from reports
2. Check current BTC/USD rate on coinmarketcap.com or similar
3. Manually calculate the USD equivalent

### Option 4: Upgrade Exchange Rate API (Future Enhancement)
To properly support cryptocurrencies, we would need to:

1. **Add a Crypto Exchange Rate API**
   - CoinGecko API (free tier available)
   - CoinMarketCap API (free tier: 10,000 calls/month)
   - Binance API (free, real-time)

2. **Hybrid Approach**
   ```typescript
   // Use exchangerate-api.com for fiat
   const fiatRates = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
   
   // Use CoinGecko for crypto
   const cryptoRates = await fetch(
     'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd'
   );
   ```

3. **Implementation Steps**
   - Update `src/services/exchangeRate.ts` to support multiple providers
   - Detect crypto currencies (BTC, ETH, USDT, USDC, etc.)
   - Fetch crypto rates separately
   - Merge fiat and crypto rates
   - Update caching to handle both types

### Option 4: Use BTC as Report Currency
If you primarily use BTC:
- Set BTC as the report currency
- All fiat amounts will fail to convert (same problem in reverse)
- Best to keep BTC-only reports separate

## Workaround Example

If you have:
- 0.04 BTC spent on "new" category
- Current BTC/USD rate: $88,000

Manual calculation:
```
0.04 BTC × $88,000 = $3,520 USD
```

## Recommended Practice

Until crypto API support is added:

1. **Keep Crypto Separate**: Use different accounts for crypto vs fiat
2. **Separate Reports**: Generate BTC reports and USD reports separately
3. **Manual Summary**: If you need a combined view, calculate manually
4. **Track in Description**: Add USD equivalent in transaction descriptions

Example transaction:
```
Description: "Coffee - ~$3.52 USD"
Amount: 0.00004 BTC
```

## Future Enhancement: Add Crypto Support

If you'd like to add crypto support yourself, here's the plan:

1. **Install axios** (if not already): `npm install axios`

2. **Create crypto exchange service**:
```typescript
// src/services/cryptoExchangeRate.ts
export class CryptoExchangeRateService {
  static async getCryptoRates(vsCurrency: string = 'usd'): Promise<any> {
    const cryptos = ['bitcoin', 'ethereum', 'tether', 'usd-coin'];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptos.join(',')}&vs_currencies=${vsCurrency}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      BTC: 1 / data.bitcoin[vsCurrency],  // Invert to get rate FROM USD TO BTC
      ETH: 1 / data.ethereum[vsCurrency],
      USDT: 1 / data.tether[vsCurrency],
      USDC: 1 / data['usd-coin'][vsCurrency],
    };
  }
}
```

3. **Update ReportGenerator.tsx** to merge rates:
```typescript
const fiatRates = await ExchangeRateService.getRates(reportCurrency);
const cryptoRates = await CryptoExchangeRateService.getCryptoRates(reportCurrency.toLowerCase());
const allRates = { ...fiatRates.rates, ...cryptoRates };
```

## Summary

**Current Status**: BTC and other cryptocurrencies are not supported by the free exchange rate API.

**Immediate Solution**: Generate separate reports for different currency types or add USD equivalent in transaction descriptions.

**Long-term Solution**: Integrate a cryptocurrency API like CoinGecko or CoinMarketCap.
