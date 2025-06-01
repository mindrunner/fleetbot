import { Game } from '@staratlas/sage'
import { mineCarbon } from '../fsm/configs/mine/mine-carbon.js'

import { mineHydrogen } from '../fsm/configs/mine/mine-hydrogen.js'
import { createInfoStrategy } from '../fsm/info.js'
import { createMiningStrategy } from '../fsm/mine.js'
import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'

import { nameMapMatcher } from './name-map-matcher.js'
import { StrategyConfig } from './strategy-config.js'

export const mainnetLuStrategy = (
    worldMap: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    return {
        match: nameMapMatcher(createInfoStrategy()),
        map: new Map([
            [
                'Butterfly Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineCarbon(worldMap),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Mouse Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(worldMap),
                        player,
                        game,
                    ),
                },
            ],
        ]),
    }
}
