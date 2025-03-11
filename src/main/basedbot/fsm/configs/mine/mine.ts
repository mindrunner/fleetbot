import {
    mineablesByCoordinates,
    WorldMap,
} from '../../../lib/sage/state/world-map'
import { getName } from '../../../lib/sage/util'
import { Coordinates } from '../../../lib/util/coordinates'

import { mineConfig, MineConfig } from './mine-config'

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
