import { Game } from '@staratlas/sage'

import { disbandConfig } from '../fsm/configs/disband-config'
import { createDisbandStrategy } from '../fsm/disband'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { nameMapMatcher } from './name-map-matcher'
import { makeStrategyMap, StrategyConfig } from './strategy-config'

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
