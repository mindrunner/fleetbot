import { Game } from '@staratlas/sage'

import { mineRochinol } from '../fsm/configs/mine/mine-rochinol'
import { createInfoStrategy } from '../fsm/info'
import { createMiningStrategy } from '../fsm/mine'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { nameMapMatcher } from './name-map-matcher'
import { StrategyConfig } from './strategy-config'

export const mainnetLuStrategy = (
    worldMap: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    return {
        match: nameMapMatcher(createInfoStrategy()),
        map: new Map([
            [
                'Vaquita Fleet',
                createMiningStrategy(mineRochinol(worldMap), player, game),
            ],
        ]),
    }
}
