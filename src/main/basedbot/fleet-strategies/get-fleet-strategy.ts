import { Game } from '@staratlas/sage'

import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { atlasnetFcStrategy } from './atlasnet-fc-strategy'

import { atlasnetLuStrategy } from './atlasnet-lu-strategy'
import { atlasnetQtStrategy } from './atlasnet-qt-strategy'
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
        case 'CgHvzwGbwWv3CwLTvEgeqSKeD8EwMdTfiiCG3dFrKVVC':
            return atlasnetFcStrategy(150)(map, player, game, 'mud')
        // return disbandAllStrategy(map, player, game)
        case '9KBrgWVjsmdZ3YEjcsa3wrbbJREgZgS7vDbgoz2aHaNm':
            return atlasnetFcStrategy(150)(map, player, game, 'ustur')
        // return disbandAllStrategy(map, player, game)
        case 'FUwHSqujzcPD44SDZYJXuk73NbkEyYQwcLMioHhpjbx2':
            return atlasnetFcStrategy(150)(map, player, game, 'oni')
        // return disbandAllStrategy(map, player, game)
        case '34ghznSJCYEMrS1aC55UYZZUuxfuurA9441aKnigmYyz':
            return atlasnetQtStrategy(1)(map, player, game, 'le.local')
        // return disbandAllStrategy(map, player, game)
        case '3wGtzSseukZ7ZAdAgRnhgP34QiLx1VWWALBsr9FYShXu':
            return atlasnetQtStrategy(1)(map, player, game, 'whosthis')
        // return disbandAllStrategy(map, player, game)
        default:
            return atlasnetFcStrategy(150)(
                map,
                player,
                game,
                player.profile.key.toBase58(),
            )
    }
}
