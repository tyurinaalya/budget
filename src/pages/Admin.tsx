import React, { useState, useEffect } from 'react';
import { Country, Currency, Account, Category, AssetType, ManualExchangeRate } from '../types';
import { WORLD_CURRENCIES } from '../data/currencies';
import { WORLD_COUNTRIES } from '../data/countries';
import { FAVORITE_CURRENCIES, FAVORITE_COUNTRIES } from '../data/favorites';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('countries');
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [manualRates, setManualRates] = useState<ManualExchangeRate[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'countries':
          setCountries(await window.electronAPI.getCountries());
          break;
        case 'currencies':
          setCurrencies(await window.electronAPI.getCurrencies());
          break;
        case 'accounts':
          setAccounts(await window.electronAPI.getAccounts());
          setCurrencies(await window.electronAPI.getCurrencies());
          setCountries(await window.electronAPI.getCountries());
          setAssetTypes(await window.electronAPI.getAssetTypes());
          break;
        case 'categories':
          setCategories(await window.electronAPI.getCategories());
          break;
        case 'assetTypes':
          setAssetTypes(await window.electronAPI.getAssetTypes());
          break;
        case 'exchangeRates':
          setManualRates(await window.electronAPI.getManualExchangeRates());
          setCurrencies(await window.electronAPI.getCurrencies());
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'countries':
          await window.electronAPI.deleteCountry(id);
          break;
        case 'currencies':
          await window.electronAPI.deleteCurrency(id);
          break;
        case 'accounts':
          await window.electronAPI.deleteAccount(id);
          break;
        case 'categories':
          await window.electronAPI.deleteCategory(id);
          break;
        case 'assetTypes':
          await window.electronAPI.deleteAssetType(id);
          break;
        case 'exchangeRates':
          await window.electronAPI.deleteManualExchangeRate(id);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. It may be in use.');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        // Update
        switch (activeTab) {
          case 'countries':
            await window.electronAPI.updateCountry(editingItem.id, data);
            break;
          case 'currencies':
            await window.electronAPI.updateCurrency(editingItem.id, data);
            break;
          case 'accounts':
            await window.electronAPI.updateAccount(editingItem.id, data);
            break;
          case 'categories':
            await window.electronAPI.updateCategory(editingItem.id, data);
            break;
          case 'assetTypes':
            await window.electronAPI.updateAssetType(editingItem.id, data);
            break;
          case 'exchangeRates':
            await window.electronAPI.updateManualExchangeRate(editingItem.id, data);
            break;
        }
      } else {
        // Add
        switch (activeTab) {
          case 'countries':
            await window.electronAPI.addCountry(data);
            break;
          case 'currencies':
            await window.electronAPI.addCurrency(data);
            break;
          case 'accounts':
            await window.electronAPI.addAccount(data);
            break;
          case 'categories':
            await window.electronAPI.addCategory(data);
            break;
          case 'assetTypes':
            await window.electronAPI.addAssetType(data);
            break;
          case 'exchangeRates':
            await window.electronAPI.addManualExchangeRate(data);
            break;
        }
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item.');
    }
  };

  const handleQuickAddCurrency = async (code: string) => {
    const currencyData = WORLD_CURRENCIES.find(c => c.code === code);
    if (!currencyData) return;

    try {
      await window.electronAPI.addCurrency({
        name: currencyData.name,
        code: currencyData.code,
        symbol: currencyData.symbol,
      });
      loadData();
    } catch (error) {
      console.error('Error adding currency:', error);
      alert('Error adding currency. It may already exist.');
    }
  };

  const handleQuickAddCountry = async (code: string) => {
    const countryData = WORLD_COUNTRIES.find(c => c.code === code);
    if (!countryData) return;

    try {
      await window.electronAPI.addCountry({
        name: countryData.name,
        code: countryData.code,
      });
      loadData();
    } catch (error) {
      console.error('Error adding country:', error);
      alert('Error adding country. It may already exist.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Admin Panel</h2>
        <p>Manage countries, currencies, accounts, categories, and asset types</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1' }}>
          {['countries', 'currencies', 'accounts', 'categories', 'assetTypes', 'exchangeRates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === tab ? '#3498db' : 'transparent',
                color: activeTab === tab ? 'white' : '#2c3e50',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Custom
          </button>
          {activeTab === 'currencies' && (
            <QuickAddCurrencies onAdd={handleQuickAddCurrency} existingCodes={currencies.map(c => c.code)} />
          )}
          {activeTab === 'countries' && (
            <QuickAddCountries onAdd={handleQuickAddCountry} existingCodes={countries.map(c => c.code)} />
          )}
        </div>

        {activeTab === 'countries' && (
          <CountriesTable countries={countries} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'currencies' && (
          <CurrenciesTable currencies={currencies} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'accounts' && (
          <AccountsTable accounts={accounts} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'categories' && (
          <CategoriesTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'assetTypes' && (
          <AssetTypesTable assetTypes={assetTypes} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'exchangeRates' && (
          <ExchangeRatesTable manualRates={manualRates} currencies={currencies} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {showModal && (
        <FormModal
          type={activeTab}
          item={editingItem}
          countries={countries}
          currencies={currencies}
          assetTypes={assetTypes}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// Quick Add Components
const QuickAddCurrencies: React.FC<{ onAdd: (code: string) => void; existingCodes: string[] }> = ({ onAdd, existingCodes }) => {
  const availableFavorites = FAVORITE_CURRENCIES.filter(code => !existingCodes.includes(code));
  const allAvailable = WORLD_CURRENCIES.filter(c => !existingCodes.includes(c.code));

  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#666' }}>Quick Add:</span>
      {availableFavorites.map(code => {
        const currency = WORLD_CURRENCIES.find(c => c.code === code);
        return (
          <button
            key={code}
            onClick={() => onAdd(code)}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '5px 10px',
              background: '#f39c12',
              border: 'none',
            }}
            title={`Add ${currency?.name}`}
          >
            ⭐ {code}
          </button>
        );
      })}
      {availableFavorites.length > 0 && availableFavorites.length < FAVORITE_CURRENCIES.length && (
        <span style={{ fontSize: '12px', color: '#27ae60', marginLeft: '5px' }}>
          ✓ Some favorites added
        </span>
      )}
      {availableFavorites.length === 0 && (
        <span style={{ fontSize: '12px', color: '#27ae60' }}>✓ All favorites added</span>
      )}
      <select
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            e.target.value = '';
          }
        }}
        style={{ fontSize: '12px', padding: '5px' }}
      >
        <option value="">Add from all ({allAvailable.length})...</option>
        {allAvailable.map(c => (
          <option key={c.code} value={c.code}>
            {c.code} - {c.name} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

const QuickAddCountries: React.FC<{ onAdd: (code: string) => void; existingCodes: string[] }> = ({ onAdd, existingCodes }) => {
  const availableFavorites = FAVORITE_COUNTRIES.filter(code => !existingCodes.includes(code));
  const allAvailable = WORLD_COUNTRIES.filter(c => !existingCodes.includes(c.code));

  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#666' }}>Quick Add:</span>
      {availableFavorites.map(code => {
        const country = WORLD_COUNTRIES.find(c => c.code === code);
        return (
          <button
            key={code}
            onClick={() => onAdd(code)}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '5px 10px',
              background: '#f39c12',
              border: 'none',
            }}
            title={`Add ${country?.name}`}
          >
            ⭐ {code}
          </button>
        );
      })}
      {availableFavorites.length > 0 && availableFavorites.length < FAVORITE_COUNTRIES.length && (
        <span style={{ fontSize: '12px', color: '#27ae60', marginLeft: '5px' }}>
          ✓ Some favorites added
        </span>
      )}
      {availableFavorites.length === 0 && (
        <span style={{ fontSize: '12px', color: '#27ae60' }}>✓ All favorites added</span>
      )}
      <select
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            e.target.value = '';
          }
        }}
        style={{ fontSize: '12px', padding: '5px' }}
      >
        <option value="">Add from all ({allAvailable.length})...</option>
        {allAvailable.map(c => (
          <option key={c.code} value={c.code}>
            {c.code} - {c.name} ({c.region})
          </option>
        ))}
      </select>
    </div>
  );
};

// Tables
const CountriesTable: React.FC<{ countries: Country[]; onEdit: any; onDelete: any }> = ({
  countries,
  onEdit,
  onDelete,
}) => {
  // Sort: favorites first, then alphabetically
  const sortedCountries = [...countries].sort((a, b) => {
    const aIsFav = FAVORITE_COUNTRIES.includes(a.code);
    const bIsFav = FAVORITE_COUNTRIES.includes(b.code);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedCountries.map((country) => {
          const isFavorite = FAVORITE_COUNTRIES.includes(country.code);
          return (
            <tr key={country.id} style={isFavorite ? { background: '#fff3cd' } : {}}>
              <td>
                {isFavorite && <span style={{ marginRight: '5px' }}>⭐</span>}
                {country.name}
              </td>
              <td>{country.code}</td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => onEdit(country)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(country.id)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const CurrenciesTable: React.FC<{ currencies: Currency[]; onEdit: any; onDelete: any }> = ({
  currencies,
  onEdit,
  onDelete,
}) => {
  // Sort: favorites first, then alphabetically
  const sortedCurrencies = [...currencies].sort((a, b) => {
    const aIsFav = FAVORITE_CURRENCIES.includes(a.code);
    const bIsFav = FAVORITE_CURRENCIES.includes(b.code);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return a.code.localeCompare(b.code);
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Symbol</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedCurrencies.map((currency) => {
          const isFavorite = FAVORITE_CURRENCIES.includes(currency.code);
          return (
            <tr key={currency.id} style={isFavorite ? { background: '#fff3cd' } : {}}>
              <td>
                {isFavorite && <span style={{ marginRight: '5px' }}>⭐</span>}
                {currency.name}
              </td>
              <td>{currency.code}</td>
              <td>{currency.symbol}</td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => onEdit(currency)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(currency.id)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const AccountsTable: React.FC<{ accounts: Account[]; onEdit: any; onDelete: any }> = ({
  accounts,
  onEdit,
  onDelete,
}) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Country</th>
        <th>Currency</th>
        <th>Asset Type</th>
        <th>Balance</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map((account) => (
        <tr key={account.id}>
          <td>{account.name}</td>
          <td>{account.owner || '-'}</td>
          <td>{account.country_name}</td>
          <td>{account.currency_code}</td>
          <td>{account.asset_type_name}</td>
          <td>
            {account.currency_symbol}
            {account.balance.toFixed(2)}
          </td>
          <td className="actions">
            <button className="btn btn-secondary" onClick={() => onEdit(account)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(account.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const CategoriesTable: React.FC<{ categories: Category[]; onEdit: any; onDelete: any }> = ({
  categories,
  onEdit,
  onDelete,
}) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {categories.map((category) => (
        <tr key={category.id}>
          <td>{category.name}</td>
          <td>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: category.type === 'income' ? '#27ae60' : '#e74c3c',
                color: 'white',
                fontSize: '12px',
              }}
            >
              {category.type}
            </span>
          </td>
          <td className="actions">
            <button className="btn btn-secondary" onClick={() => onEdit(category)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(category.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AssetTypesTable: React.FC<{ assetTypes: AssetType[]; onEdit: any; onDelete: any }> = ({
  assetTypes,
  onEdit,
  onDelete,
}) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {assetTypes.map((assetType) => (
        <tr key={assetType.id}>
          <td>{assetType.name}</td>
          <td>{assetType.description || '-'}</td>
          <td className="actions">
            <button className="btn btn-secondary" onClick={() => onEdit(assetType)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(assetType.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Form Modal
const FormModal: React.FC<any> = ({ type, item, countries, currencies, assetTypes, onSave, onClose }) => {
  const [formData, setFormData] = useState<any>(item || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTemplateSelect = (code: string) => {
    if (type === 'currencies') {
      const template = WORLD_CURRENCIES.find(c => c.code === code);
      if (template) {
        setFormData({ code: template.code, name: template.name, symbol: template.symbol });
      }
    } else if (type === 'countries') {
      const template = WORLD_COUNTRIES.find(c => c.code === code);
      if (template) {
        setFormData({ code: template.code, name: template.name });
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{item ? 'Edit' : 'Add'} {type}</h3>
        <form onSubmit={handleSubmit}>
          {type === 'countries' && (
            <>
              {!item && (
                <div className="form-group">
                  <label>Load from Template (optional)</label>
                  <select
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    value=""
                  >
                    <option value="">-- Select a country template --</option>
                    {WORLD_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code}) - {c.region}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </div>
            </>
          )}

          {type === 'currencies' && (
            <>
              {!item && (
                <div className="form-group">
                  <label>Load from Template (optional)</label>
                  <select
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    value=""
                  >
                    <option value="">-- Select a currency template --</option>
                    <optgroup label="⭐ Favorites">
                      {FAVORITE_CURRENCIES.map(code => {
                        const curr = WORLD_CURRENCIES.find(c => c.code === code);
                        return curr ? (
                          <option key={curr.code} value={curr.code}>
                            {curr.name} ({curr.code}) {curr.symbol}
                          </option>
                        ) : null;
                      })}
                    </optgroup>
                    <optgroup label="All Currencies">
                      {WORLD_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code}) {c.symbol}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </div>
              <div className="form-group">
                <label>Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {type === 'accounts' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner (optional)</label>
                <input
                  type="text"
                  name="owner"
                  value={formData.owner || ''}
                  onChange={handleChange}
                  placeholder="e.g., John, Mary, Family"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <select
                  name="country_id"
                  value={formData.country_id || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country: Country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  name="currency_id"
                  value={formData.currency_id || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Currency</option>
                  {currencies.map((currency: Currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  name="asset_type_id"
                  value={formData.asset_type_id || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Asset Type</option>
                  {assetTypes.map((assetType: AssetType) => (
                    <option key={assetType.id} value={assetType.id}>
                      {assetType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Initial Balance</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance || 0}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
            </>
          )}

          {type === 'categories' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type || 'expense'}
                  onChange={handleChange}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </>
          )}

          {type === 'assetTypes' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {type === 'exchangeRates' && (
            <>
              <div style={{ padding: '10px', background: '#e7f3ff', borderRadius: '8px', marginBottom: '15px' }}>
                <strong>ℹ️ Exchange Rate Format:</strong>
                <br />
                1 FROM currency = [RATE] TO currency
                <br />
                <small>Example: 1 USD = 0.000011 BTC (enter 0.000011 as rate)</small>
              </div>
              <div className="form-group">
                <label>From Currency *</label>
                <select
                  name="from_currency"
                  value={formData.from_currency || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Currency --</option>
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>To Currency *</label>
                <select
                  name="to_currency"
                  value={formData.to_currency || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Currency --</option>
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Exchange Rate * (1 FROM = ? TO)</label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate || ''}
                  onChange={handleChange}
                  required
                  step="0.00000001"
                  min="0"
                  placeholder="0.000011"
                />
                <small style={{ color: '#7f8c8d', marginTop: '5px', display: 'block' }}>
                  Enter the rate with up to 8 decimal places for precision
                </small>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="e.g., BTC/USD rate from CoinMarketCap on 2025-10-04"
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exchange Rates Table Component
const ExchangeRatesTable: React.FC<{
  manualRates: ManualExchangeRate[];
  currencies: Currency[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}> = ({ manualRates, currencies, onEdit, onDelete }) => {
  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '';
  };

  return (
    <>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>💱 Manual Exchange Rates</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
          <strong>Purpose:</strong> Add custom exchange rates for cryptocurrencies or other currencies not supported by the automatic API.
          <br />
          <strong>Format:</strong> 1 FROM currency = X TO currency (e.g., 1 USD = 0.000011 BTC means rate = 0.000011)
          <br />
          <strong>Usage:</strong> These rates will be used in reports when the automatic API doesn't provide a rate.
        </p>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>From Currency</th>
            <th>To Currency</th>
            <th>Exchange Rate</th>
            <th>Description</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {manualRates.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No manual exchange rates added yet.
                <br />
                <small>Add rates for cryptocurrencies like BTC, ETH, or any currency pair you need.</small>
              </td>
            </tr>
          ) : (
            manualRates.map((rate) => (
              <tr key={rate.id}>
                <td>
                  <strong>{rate.from_currency}</strong> {getCurrencySymbol(rate.from_currency)}
                </td>
                <td>
                  <strong>{rate.to_currency}</strong> {getCurrencySymbol(rate.to_currency)}
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#2c3e50' }}>
                    {rate.rate.toFixed(8)}
                  </span>
                  <br />
                  <small style={{ color: '#7f8c8d' }}>
                    1 {rate.from_currency} = {rate.rate.toFixed(8)} {rate.to_currency}
                  </small>
                </td>
                <td>{rate.description || '-'}</td>
                <td>{new Date(rate.updated_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => onEdit(rate)} className="btn btn-primary" style={{ marginRight: '5px' }}>
                    Edit
                  </button>
                  <button onClick={() => onDelete(rate.id)} className="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};

export default Admin;
