import { WarpMode } from '../../lib/sage/act/move'
import { Mineable } from '../../lib/sage/state/world-map'
import { Coordinates } from '../../lib/util/coordinates'

export type MineConfig = {
    homeBase: Coordinates
    targetBase: Coordinates
    resource: Mineable
    warpMode: WarpMode
}

export const mineConfig = (
    config: Partial<MineConfig> & { resource: Mineable },
): MineConfig => ({
    homeBase: config.homeBase || Coordinates.fromNumber(-40, 30),
    targetBase: config.targetBase || Coordinates.fromNumber(-22, 32),
    resource: config.resource,
    warpMode: config.warpMode || 'auto',
})
