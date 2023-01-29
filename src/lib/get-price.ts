import Big from 'big.js'

import { Amounts } from '../service/fleet/const'
import { getResourcePrices } from '../service/gm'

export const getPrice = async (amount: Amounts): Promise<Big> => {
    const price = await getResourcePrices()
    const totalFuelPrice = amount.fuel.mul(price.fuel)
    const totalFoodPrice = amount.food.mul(price.food)
    const totalAmmoPrice = amount.ammo.mul(price.ammo)
    const totalToolPrice = amount.tool.mul(price.tool)

    return totalFuelPrice.add(totalFoodPrice).add(totalAmmoPrice).add(totalToolPrice)
}
