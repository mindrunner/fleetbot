import { Game } from '@staratlas/sage'

import { disbandConfig } from '../fsm/configs/disband-config.js'
import { createDisbandStrategy } from '../fsm/disband.js'
import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'

import { nameMapMatcher } from './name-map-matcher.js'
import { makeStrategyMap, StrategyConfig } from './strategy-config.js'

export const disbandAllStrategy = (
    worldMap: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    return {
        match: nameMapMatcher(
            createDisbandStrategy(
                disbandConfig({ worldMap, homeBase: player.homeCoordinates }),
                player,
                game,
            ),
        ),
        map: makeStrategyMap(),
    }
}
