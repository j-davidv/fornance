import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { isDarkMode, toggleDarkMode, cashBalance, updateCurrency, isLoading } = useStore();
  const [conversionError, setConversionError] = useState<string | null>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'NTD', name: 'New Taiwan Dollar' },
  ];

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    if (newCurrency !== cashBalance.currency) {
      setConversionError(null);
      try {
        await updateCurrency(newCurrency);
      } catch (error) {
        if (error instanceof Error) {
          setConversionError(error.message);
        } else {
          setConversionError('An unexpected error occurred during currency conversion');
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-morphism p-6 rounded-2xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="glass-morphism p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Theme</h2>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <MoonIcon className="w-6 h-6 text-primary-600" />
                ) : (
                  <SunIcon className="w-6 h-6 text-primary-600" />
                )}
              </button>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="glass-morphism p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Currency Settings
            </h2>
            <div className="flex flex-col space-y-2">
              <label className="text-foreground">Default Currency</label>
              <select
                className="select select-bordered w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={cashBalance.currency}
                onChange={handleCurrencyChange}
                disabled={isLoading}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              {isLoading && (
                <div className="text-sm text-primary-600">
                  Converting currencies... Please wait...
                </div>
              )}
              {conversionError && (
                <div className="text-sm text-error">
                  {conversionError}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Changing the currency will automatically convert your balance and expenses
                to the new currency using current exchange rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 