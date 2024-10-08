import {
    mineableByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map'
import { Coordinates } from '../../../lib/util/coordinates'

import { mineConfig, MineConfig } from './mine-config'

export const mine = (
    map: WorldMap,
    homeBase: Coordinates,
    targetBase: Coordinates,
): MineConfig =>
    mineConfig({
        homeBase,
        targetBase,
        resource: mineableByCoordinates(map, targetBase).values().next().value,
    })
