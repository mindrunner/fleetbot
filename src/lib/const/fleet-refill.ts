import { ShipStakingInfo } from '@staratlas/factory'
import Big from 'big.js'

import { Amounts } from '../../service/fleet/const'

export interface FleetRefill {
    shipStakingInfo: ShipStakingInfo
    amount: Amounts
    price: Big
}
