export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$',  name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$',name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$',name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand' },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won' },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'ILS', symbol: '₪',  name: 'Israeli Shekel' },
  { code: 'PHP', symbol: '₱',  name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht' },
]

export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) ?? { code, symbol: code, name: code }
}

export function formatAmount(amount, code) {
  const { symbol } = getCurrency(code)
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
