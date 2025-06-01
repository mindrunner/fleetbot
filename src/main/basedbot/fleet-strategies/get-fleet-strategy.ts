import { Game } from '@staratlas/sage'
import { config } from '../../../config/index.js'

import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'
import { atlasnetFcStrategy } from './atlasnet-fc-strategy.js'

import { atlasnetLuStrategy } from './atlasnet-lu-strategy.js'
import { disbandAllStrategy } from './disband-all-strategy.js'
import { mainnetGellsnStrategy } from './mainnet-gellsn-strategy.js'
import { mainnetLuStrategy } from './mainnet-lu-strategy.js'
import { StrategyConfig } from './strategy-config.js'

export const getFleetStrategy = (
    map: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    switch (player.publicKey.toString()) {
        case '4GZeR3hQdQXgoaEG22Gj4egAPX3db7So41rsHtBhHBk8':
            return mainnetGellsnStrategy(map, player, game)
        case 'k49Y5xwN7Nyi19TqDR4zbCFuAt8kgy6qMaJ6Kj1wHrn':
            return atlasnetLuStrategy(map, player, game)
        case 'AePY3wEoUFcFuXeUU9X26YK6tNKQMZovBgvY54LK2B8N':
            return mainnetLuStrategy(map, player, game)
        default:
            return config.app.basedCleanup
                ? disbandAllStrategy(map, player, game)
                : atlasnetFcStrategy(config.app.fleetCount)(
                      map,
                      player,
                      game,
                      player.profile.key.toBase58(),
                  )
    }
}
