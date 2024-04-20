import { mineableByCoordinates, WorldMap } from '../../lib/sage/state/world-map'
import { Coordinates } from '../../lib/util/coordinates'

import { MineConfig, mineConfig } from './mine-config'

export const mineBiomass = (map: WorldMap): MineConfig => mineConfig({
    homeBase: Coordinates.fromNumber(-40, 30),
    targetBase: Coordinates.fromNumber(-42, 35),
    resource: mineableByCoordinates(map, Coordinates.fromNumber(-42, 35)).values().next().value,
})
