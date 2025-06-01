import { Game } from '@staratlas/sage'

import { createDestructStrategy, destructConfig } from '../fsm/destruct.js'
import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'

import { nameMapMatcher } from './name-map-matcher.js'
import { makeStrategyMap, StrategyConfig } from './strategy-config.js'

export const destructAllStrategy = (
    worldMap: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    return {
        match: nameMapMatcher(
            createDestructStrategy(destructConfig({ worldMap }), player, game),
        ),
        map: makeStrategyMap(),
    }
}
