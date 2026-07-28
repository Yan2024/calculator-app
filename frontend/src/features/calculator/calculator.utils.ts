export function parseDisplay(display: string): number {
  return Number(display.replace(',', '.'))
}

export function formatNumber(value: number): string {
  const normalizedValue = Object.is(value, -0) ? 0 : value
  const roundedValue = Number.parseFloat(
    normalizedValue.toPrecision(12),
  )

  return roundedValue.toString().replace('.', ',')
}
