import { getScoreVarsShipInfo, ShipStakingInfo } from '@staratlas/factory'

import dayjs from '../dayjs.js'
import { getFleetRemainingResources } from '../service/fleet/index.js'
import { connection, fleetProgram } from '../service/sol/index.js'

type FleetDepletionInfo = {
    seconds: number
    human: string
}

export const fleetDepletionInfo = async (
    shipStakingInfo: ShipStakingInfo,
): Promise<FleetDepletionInfo> => {
    const info = await getScoreVarsShipInfo(
        connection,
        fleetProgram,
        shipStakingInfo.shipMint,
    )
    const remainingResources = getFleetRemainingResources(info, shipStakingInfo)

    const secondsLeft = Math.min(
        remainingResources.food.secondsLeft,
        remainingResources.ammo.secondsLeft,
        remainingResources.fuel.secondsLeft,
        remainingResources.tool.secondsLeft,
    )

    return {
        seconds: secondsLeft,
        human: dayjs.duration(secondsLeft, 'seconds').humanize(false),
    }
}
