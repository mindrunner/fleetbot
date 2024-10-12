import { Game } from '@staratlas/sage'

import { createDestructStrategy, destructConfig } from '../fsm/destruct'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { nameMapMatcher } from './name-map-matcher'
import { makeStrategyMap, StrategyConfig } from './strategy-config'

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
