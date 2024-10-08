import { Game } from '@staratlas/sage'

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
                'Red Ruffed Lemur Fleet',
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
