export async function getExchangeRate(from: string, to: string, date: Date): Promise<number | null> {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/f4b18e2c4541ec45f425e834/latest/${from}`
    )
    const data = await response.json()

    return data.conversion_rates[to] || null
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error)
    return null
  }
}
