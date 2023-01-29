import Big from 'big.js'

export const max = (a: Big, b: Big): Big => a.gte(b) ? a : b
