import BN from 'bn.js'

import { Coordinates } from '../../util/coordinates.js'

export const transformSector = (sector: BN[]): Coordinates =>
    Coordinates.fromBN(sector[0], sector[1])
