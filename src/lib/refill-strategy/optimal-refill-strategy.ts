import { getScoreVarsShipInfo } from '@staratlas/factory'
import Big from 'big.js'

import { getFleetRemainingResources } from '../../service/fleet/index.js'
import { Amounts } from '../../service/fleet/const/index.js'
import { connection, fleetProgram } from '../../service/sol/index.js'
import { FleetRefill, max } from '../const/index.js'
import { getPrice } from '../get-price.js'

import { RefillStrategy } from './refill-strategy.js'

export const optimalRefillStrategy: RefillStrategy = async (
    shipStakingInfos,
) => {
    const targets = await Promise.all(
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

            return Math.min(
                remainingResources.food.maxSeconds,
                remainingResources.ammo.maxSeconds,
                remainingResources.fuel.maxSeconds,
                remainingResources.tool.maxSeconds,
            )
        }),
    )
    const target = targets.reduce(
        (acc, cur) => Math.min(acc, cur),
        Number.MAX_SAFE_INTEGER,
    )

    return Promise.all(
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
                food: max(
                    Big(target)
                        .minus(remainingResources.food.secondsLeft)
                        .mul(remainingResources.food.burnRatePerFleet)
                        .round(),
                    Big(0),
                ),
                ammo: max(
                    Big(target)
                        .minus(remainingResources.ammo.secondsLeft)
                        .mul(remainingResources.ammo.burnRatePerFleet)
                        .round(),
                    Big(0),
                ),
                fuel: max(
                    Big(target)
                        .minus(remainingResources.fuel.secondsLeft)
                        .mul(remainingResources.fuel.burnRatePerFleet)
                        .round(),
                    Big(0),
                ),
                tool: max(
                    Big(target)
                        .minus(remainingResources.tool.secondsLeft)
                        .mul(remainingResources.tool.burnRatePerFleet)
                        .round(),
                    Big(0),
                ),
            }

            return {
                shipStakingInfo,
                amount,
                price: getPrice(amount),
            } as FleetRefill
        }),
    )
}
