import {
    mineableByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map'
import { Coordinates } from '../../../lib/util/coordinates'

import { MineConfig, mineConfig } from './mine-config'

export const mineSilicia = (map: WorldMap): MineConfig =>
    mineConfig({
        homeBase: Coordinates.fromNumber(-40, 30),
        targetBase: Coordinates.fromNumber(-22, 32),
        resource: mineableByCoordinates(
            map,
            Coordinates.fromNumber(-22, 32),
            'Silicia',
        ),
        worldMap: map,
    })
