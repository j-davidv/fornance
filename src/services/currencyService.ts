// Get API key from environment variable
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

// Validate API key
if (!API_KEY) {
  console.error('Exchange Rate API key is missing. Please add VITE_EXCHANGE_RATE_API_KEY to your .env file.');
}

const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Currency code mapping for non-standard codes
const CURRENCY_CODE_MAP: { [key: string]: string } = {
  NTD: 'TWD', // New Taiwan Dollar
};

// Add decimal place configuration for different currencies
const CURRENCY_DECIMALS: { [key: string]: number } = {
  JPY: 0,  // Japanese Yen doesn't use decimals
  KRW: 0,  // Korean Won doesn't use decimals
  TWD: 0,  // Taiwan Dollar doesn't use decimals
  DEFAULT: 2, // Default to 2 decimal places for other currencies
};

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

interface ApiErrorResponse {
  error: string;
}

const getStandardCurrencyCode = (currency: string): string => {
  return CURRENCY_CODE_MAP[currency] || currency;
};

export const fetchExchangeRates = async (baseCurrency: string, retries = 3): Promise<ExchangeRateResponse> => {
  try {
    if (!API_KEY) {
      throw new Error('Exchange Rate API key is not configured. Please add VITE_EXCHANGE_RATE_API_KEY to your .env file.');
    }

    const standardCode = getStandardCurrencyCode(baseCurrency);
    const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${standardCode}`);
    
    if (!response.ok) {
      const errorData = await response.json() as ApiErrorResponse;
      
      // Handle specific API errors
      if (response.status === 429 && retries > 0) {
        // Rate limit hit - wait and retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000));
        return fetchExchangeRates(baseCurrency, retries - 1);
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your ExchangeRate-API key configuration.');
      }
      
      throw new Error(errorData.error || `Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json() as ExchangeRateResponse;
    
    // Validate response data
    if (!data.conversion_rates || Object.keys(data.conversion_rates).length === 0) {
      throw new Error('Invalid response from exchange rate API: No conversion rates found');
    }

    // Map back to custom currency codes if needed
    const mappedRates: { [key: string]: number } = {};
    Object.entries(data.conversion_rates).forEach(([code, rate]) => {
      const customCode = Object.entries(CURRENCY_CODE_MAP).find(([_, std]) => std === code)?.[0];
      mappedRates[customCode || code] = rate;
    });

    return {
      ...data,
      conversion_rates: mappedRates,
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    if (error instanceof Error) {
      throw new Error(`Currency conversion failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching exchange rates');
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  try {
    // Handle same currency conversion
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await getCachedExchangeRates(fromCurrency);
    const rate = rates.conversion_rates[toCurrency];

    if (!rate) {
      throw new Error(`No conversion rate found for ${fromCurrency} to ${toCurrency}. Please try a different currency.`);
    }

    // Get the appropriate number of decimal places for the target currency
    const decimals = CURRENCY_DECIMALS[toCurrency] ?? CURRENCY_DECIMALS.DEFAULT;
    
    // Perform conversion with proper decimal handling
    const convertedAmount = amount * rate;
    const roundedAmount = Number(convertedAmount.toFixed(decimals));

    return roundedAmount;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Currency conversion is temporarily unavailable. Please try again later or contact support.');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Too many currency conversion requests. Please try again in a few minutes.');
      }
    }
    throw error;
  }
};

// Cache exchange rates for 1 hour
const ratesCache = new Map<string, { rates: ExchangeRateResponse; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const getCachedExchangeRates = async (baseCurrency: string): Promise<ExchangeRateResponse> => {
  const cached = ratesCache.get(baseCurrency);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }

  const rates = await fetchExchangeRates(baseCurrency);
  ratesCache.set(baseCurrency, { rates, timestamp: now });
  return rates;
}; 