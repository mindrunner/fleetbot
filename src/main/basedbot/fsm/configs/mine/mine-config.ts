import { WarpMode } from '../../../lib/sage/act/move'
import { Mineable } from '../../../lib/sage/state/world-map'
import { Coordinates } from '../../../lib/util/coordinates'

export type MineConfig = {
    homeBase: Coordinates
    targetBase: Coordinates
    resource: Mineable
    warpMode: WarpMode
}

export const mineConfig = (
    config: Partial<MineConfig> & {
        homeBase: Coordinates
        targetBase: Coordinates
        resource: Mineable
    },
): MineConfig => ({
    homeBase: config.homeBase,
    targetBase: config.targetBase,
    resource: config.resource,
    warpMode: config.warpMode || 'auto',
})
