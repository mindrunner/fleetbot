import { Game } from '@staratlas/sage'
import { config } from '../../../config'

import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { atlasnetFcStrategy } from './atlasnet-fc-strategy'

import { atlasnetLuStrategy } from './atlasnet-lu-strategy'
import { disbandAllStrategy } from './disband-all-strategy'
import { mainnetGellsnStrategy } from './mainnet-gellsn-strategy'
import { mainnetLuStrategy } from './mainnet-lu-strategy'
import { StrategyConfig } from './strategy-config'

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
                : atlasnetFcStrategy(150)(
                      map,
                      player,
                      game,
                      player.profile.key.toBase58(),
                  )
    }
}
