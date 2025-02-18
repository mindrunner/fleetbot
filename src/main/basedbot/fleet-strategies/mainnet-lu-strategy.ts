import { Game } from '@staratlas/sage'
import { mineCarbon } from '../fsm/configs/mine/mine-carbon'

import { mineHydrogen } from '../fsm/configs/mine/mine-hydrogen'
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
                'Mouse',
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
