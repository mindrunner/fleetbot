import { mineRochinol } from '../fsm/configs/mine-rochinol'
import { createMiningStrategy } from '../fsm/mine'
import { Strategy } from '../fsm/strategy'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

export const mainnetLuStrategy = (
    map: WorldMap,
    player: Player,
): Map<string, Strategy> =>
    new Map([
        ['Vaquita Fleet', createMiningStrategy(mineRochinol(map), player)],
    ])
