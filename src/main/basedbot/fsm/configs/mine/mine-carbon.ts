import {
    mineableByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map.js'
import { Coordinates } from '../../../lib/util/coordinates.js'

import { MineConfig, mineConfig } from './mine-config.js'

export const mineCarbon = (map: WorldMap): MineConfig =>
    mineConfig({
        homeBase: Coordinates.fromNumber(-40, 30),
        targetBase: Coordinates.fromNumber(-30, 30),
        resource: mineableByCoordinates(
            map,
            Coordinates.fromNumber(-30, 30),
            'Carbon',
        ),
        worldMap: map,
    })
