import { ShipStakingInfo } from '@staratlas/factory'

import { FleetRefill } from '../const/index.js'

export type RefillStrategy = (
    shipStakingInfos: ShipStakingInfo[],
) => Promise<FleetRefill[]>
