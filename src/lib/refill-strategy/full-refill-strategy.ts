import { getScoreVarsShipInfo } from '@staratlas/factory'
import Big from 'big.js'

import { getFleetRemainingResources } from '../../service/fleet/index.js'
import { Amounts } from '../../service/fleet/const/index.js'
import { connection, fleetProgram } from '../../service/sol/index.js'
import { FleetRefill } from '../const/index.js'
import { getPrice } from '../get-price.js'

import { RefillStrategy } from './refill-strategy.js'

export const fullRefillStrategy: RefillStrategy = (shipStakingInfos) =>
    Promise.all(
        shipStakingInfos.map(async (shipStakingInfo) => {
            const info = await getScoreVarsShipInfo(
                connection,
                fleetProgram,
                shipStakingInfo.shipMint,
            )

            const remainingResources = getFleetRemainingResources(
                info,
                shipStakingInfo,
            )

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
                    .round(0, Big.roundDown),
            }

            return {
                shipStakingInfo,
                amount,
                price: getPrice(amount),
            } as FleetRefill
        }),
    )
