// Sample data seeder script
// Run this to populate your database with example data for testing

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // 1. Add Countries
    console.log('Adding countries...');
    const usa = await window.electronAPI.addCountry({
      name: 'United States',
      code: 'US',
    });
    
    const uk = await window.electronAPI.addCountry({
      name: 'United Kingdom',
      code: 'GB',
    });

    const germany = await window.electronAPI.addCountry({
      name: 'Germany',
      code: 'DE',
    });

    // 2. Add Currencies
    console.log('Adding currencies...');
    const usd = await window.electronAPI.addCurrency({
      name: 'US Dollar',
      code: 'USD',
      symbol: '$',
    });

    const gbp = await window.electronAPI.addCurrency({
      name: 'British Pound',
      code: 'GBP',
      symbol: '£',
    });

    const eur = await window.electronAPI.addCurrency({
      name: 'Euro',
      code: 'EUR',
      symbol: '€',
    });

    // 3. Add Asset Types
    console.log('Adding asset types...');
    const checking = await window.electronAPI.addAssetType({
      name: 'Checking',
      description: 'Regular checking account for daily transactions',
    });

    const savings = await window.electronAPI.addAssetType({
      name: 'Savings',
      description: 'Savings account for emergency fund',
    });

    const investment = await window.electronAPI.addAssetType({
      name: 'Investment',
      description: 'Investment accounts (stocks, bonds, etc.)',
    });

    const cash = await window.electronAPI.addAssetType({
      name: 'Cash',
      description: 'Physical cash on hand',
    });

    // 4. Add Categories
    console.log('Adding categories...');
    
    // Income categories
    await window.electronAPI.addCategory({ name: 'Salary', type: 'income' });
    await window.electronAPI.addCategory({ name: 'Freelance', type: 'income' });
    await window.electronAPI.addCategory({ name: 'Investment Returns', type: 'income' });
    await window.electronAPI.addCategory({ name: 'Gift', type: 'income' });
    await window.electronAPI.addCategory({ name: 'Other Income', type: 'income' });

    // Expense categories
    await window.electronAPI.addCategory({ name: 'Groceries', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Rent', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Utilities', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Transportation', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Entertainment', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Healthcare', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Education', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Shopping', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Dining Out', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Travel', type: 'expense' });
    await window.electronAPI.addCategory({ name: 'Other Expense', type: 'expense' });

    // 5. Get IDs for accounts (you'll need to adjust these based on actual returned IDs)
    console.log('Adding accounts...');
    const currencies = await window.electronAPI.getCurrencies();
    const countries = await window.electronAPI.getCountries();
    const assetTypes = await window.electronAPI.getAssetTypes();

    const usdCurrency = currencies.find(c => c.code === 'USD');
    const gbpCurrency = currencies.find(c => c.code === 'GBP');
    const eurCurrency = currencies.find(c => c.code === 'EUR');
    
    const usCountry = countries.find(c => c.code === 'US');
    const ukCountry = countries.find(c => c.code === 'GB');
    const deCountry = countries.find(c => c.code === 'DE');
    
    const checkingType = assetTypes.find(t => t.name === 'Checking');
    const savingsType = assetTypes.find(t => t.name === 'Savings');
    const investmentType = assetTypes.find(t => t.name === 'Investment');

    // Add some accounts
    await window.electronAPI.addAccount({
      name: 'US Checking Account',
      currency_id: usdCurrency.id,
      country_id: usCountry.id,
      asset_type_id: checkingType.id,
      balance: 5000.00,
    });

    await window.electronAPI.addAccount({
      name: 'US Savings Account',
      currency_id: usdCurrency.id,
      country_id: usCountry.id,
      asset_type_id: savingsType.id,
      balance: 15000.00,
    });

    await window.electronAPI.addAccount({
      name: 'UK Bank Account',
      currency_id: gbpCurrency.id,
      country_id: ukCountry.id,
      asset_type_id: checkingType.id,
      balance: 2000.00,
    });

    await window.electronAPI.addAccount({
      name: 'Germany Investment',
      currency_id: eurCurrency.id,
      country_id: deCountry.id,
      asset_type_id: investmentType.id,
      balance: 10000.00,
    });

    console.log('Database seeding completed successfully!');
    console.log('You can now:');
    console.log('1. Go to Admin to view all the data');
    console.log('2. Go to Budgeting to add transactions');
    console.log('3. Go to Analytics to see charts and visualizations');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Note: This is a sample script. To use it:
// 1. Open the application
// 2. Open Developer Tools (Ctrl+Shift+I or Cmd+Option+I)
// 3. Paste this entire file content into the console
// 4. Run: seedDatabase()
//
// Or you can create a button in the UI to run this function during development.
