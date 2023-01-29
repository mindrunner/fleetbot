import { getScoreVarsShipInfo } from '@staratlas/factory'
import Big from 'big.js'

import { getFleetRemainingResources } from '../../service/fleet'
import { Amounts } from '../../service/fleet/const'
import { connection, fleetProgram } from '../../service/sol'
import { FleetRefill } from '../const'
import { getPrice } from '../get-price'

import { RefillStrategy } from './refill-strategy'

export const fullRefillStrategy: RefillStrategy = shipStakingInfos =>
    Promise.all(shipStakingInfos.map(async (shipStakingInfo) => {
        const info = await getScoreVarsShipInfo(connection, fleetProgram, shipStakingInfo.shipMint)

        const remainingResources = getFleetRemainingResources(info, shipStakingInfo)

        const amount: Amounts = {
            food: Big(remainingResources.food.maxUnits)
                .minus(remainingResources.food.unitsLeft)
                .round(0, Big.roundDown),
            ammo: Big(remainingResources.ammo.maxUnits)
                .minus(remainingResources.ammo.unitsLeft)
                .round(0, Big.roundDown),
            fuel: Big(remainingResources.fuel.maxUnits)
                .minus(remainingResources.fuel.unitsLeft)
                .round(0, Big.roundDown),
            tool: Big(remainingResources.tool.maxUnits)
                .minus(remainingResources.tool.unitsLeft)
                .round(0, Big.roundDown)
        }

        return {
            shipStakingInfo,
            amount,
            price: await getPrice(amount)
        } as FleetRefill
    }))
