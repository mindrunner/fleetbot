import { ShipStakingInfo } from '@staratlas/factory'

import { FleetRefill } from '../const'

export type RefillStrategy = (
    shipStakingInfos: ShipStakingInfo[],
) => Promise<FleetRefill[]>
