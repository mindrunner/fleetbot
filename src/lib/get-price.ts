import Big from 'big.js'

import { Amounts } from '../service/fleet/const'
import { getResourcePrices } from '../service/gm'

export const getPrice = (amount: Amounts, price?: Amounts): Big => {
    const p: Amounts = price ? price : getResourcePrices()
    const totalFuelPrice = amount.fuel.mul(p.fuel)
    const totalFoodPrice = amount.food.mul(p.food)
    const totalAmmoPrice = amount.ammo.mul(p.ammo)
    const totalToolPrice = amount.tool.mul(p.tool)

    return totalFuelPrice
        .add(totalFoodPrice)
        .add(totalAmmoPrice)
        .add(totalToolPrice)
}
