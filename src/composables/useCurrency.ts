export function useCurrency() {
  const format = (amount: number): string => {
    return `KES ${amount.toLocaleString('en-KE')}`
  }

  const formatCompact = (amount: number): string => {
    if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`
    return format(amount)
  }

  return { format, formatCompact }
}
