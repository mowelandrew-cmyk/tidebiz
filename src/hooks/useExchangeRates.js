import { useState, useEffect, useRef } from 'react'

const cache = {}

// Try multiple providers in order — first success wins
async function fetchRates(base) {
  const providers = [
    {
      url: `https://api.frankfurter.app/latest?from=${base}`,
      parse: data => ({ ...data.rates, [base]: 1 }),
    },
    {
      url: `https://open.er-api.com/v6/latest/${base}`,
      parse: data => data.rates, // already includes base: 1
    },
  ]

  for (const { url, parse } of providers) {
    try {
      const r = await fetch(url)
      if (!r.ok) continue
      const data = await r.json()
      const rates = parse(data)
      if (rates && typeof rates === 'object') return rates
    } catch {
      // try next provider
    }
  }
  return null
}

export function useExchangeRates(baseCurrency) {
  const [rateState, setRateState] = useState({ rates: null, base: null })
  const requestedBase = useRef(baseCurrency)

  useEffect(() => {
    if (!baseCurrency) return
    requestedBase.current = baseCurrency

    if (cache[baseCurrency]) {
      setRateState({ rates: cache[baseCurrency], base: baseCurrency })
      return
    }

    fetchRates(baseCurrency).then(rates => {
      // Ignore if the user already switched to a different currency
      if (requestedBase.current !== baseCurrency) return
      if (rates) {
        cache[baseCurrency] = rates
        setRateState({ rates, base: baseCurrency })
      } else {
        console.error(`All exchange rate providers failed for ${baseCurrency}`)
        // Mark as resolved so we don't show '—' forever
        setRateState(prev => ({ rates: prev.rates, base: baseCurrency }))
      }
    })
  }, [baseCurrency])

  // loading until we have rates specifically for the current base
  const loading = rateState.base !== baseCurrency

  function convert(amount, fromCurrency) {
    const { rates, base } = rateState
    if (!rates) return amount
    if (fromCurrency === base) return amount
    const rate = rates[fromCurrency]
    if (!rate) return amount
    return amount / rate
  }

  return { loading, convert }
}
