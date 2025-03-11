import {
    mineableByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map'
import { Coordinates } from '../../../lib/util/coordinates'

import { MineConfig, mineConfig } from './mine-config'

export const mineCopperOre = (map: WorldMap): MineConfig =>
    mineConfig({
        homeBase: Coordinates.fromNumber(-40, 30),
        targetBase: Coordinates.fromNumber(-47, 30),
        resource: mineableByCoordinates(
            map,
            Coordinates.fromNumber(-47, 30),
            'Copper Ore',
        ),
        worldMap: map,
    })
