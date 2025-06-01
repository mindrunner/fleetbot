import {
    mineableByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map.js'
import { Coordinates } from '../../../lib/util/coordinates.js'

import { MineConfig, mineConfig } from './mine-config.js'

export const mineNitrogen = (map: WorldMap): MineConfig =>
    mineConfig({
        homeBase: Coordinates.fromNumber(-40, 30),
        targetBase: Coordinates.fromNumber(-45, 15),
        resource: mineableByCoordinates(
            map,
            Coordinates.fromNumber(-45, 15),
            'Nitrogen',
        ),
        worldMap: map,
    })
