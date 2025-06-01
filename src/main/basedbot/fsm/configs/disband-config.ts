import { WarpMode } from '../../lib/sage/act/move.js'
import { WorldMap } from '../../lib/sage/state/world-map.js'
import { Coordinates } from '../../lib/util/coordinates.js'

export type DisbandConfig = {
    worldMap: WorldMap
    homeBase: Coordinates
    warpMode: WarpMode
}

export const disbandConfig = (
    config: Partial<DisbandConfig> & {
        worldMap: WorldMap
        homeBase: Coordinates
    },
): DisbandConfig => ({
    worldMap: config.worldMap,
    homeBase: config.homeBase,
    warpMode: config.warpMode || 'auto',
})
