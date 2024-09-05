import { WarpMode } from '../../lib/sage/act/move'
import { WorldMap } from '../../lib/sage/state/world-map'
import { Coordinates } from '../../lib/util/coordinates'

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
