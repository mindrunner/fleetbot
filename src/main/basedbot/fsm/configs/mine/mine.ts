import {
    mineablesByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map.js'
import { getName } from '../../../lib/sage/util.js'
import { Coordinates } from '../../../lib/util/coordinates.js'

import { mineConfig, MineConfig } from './mine-config.js'

export const mine = (
    map: WorldMap,
    homeBase: Coordinates,
    targetBase: Coordinates,
    chance: Chance.Chance,
): MineConfig =>
    mineConfig({
        homeBase,
        targetBase,
        resource: chance.pickone(
            Array.from(mineablesByCoordinates(map, targetBase)).sort((m, n) =>
                getName(m.mineItem).localeCompare(getName(n.mineItem)),
            ),
        ),
        worldMap: map,
    })
