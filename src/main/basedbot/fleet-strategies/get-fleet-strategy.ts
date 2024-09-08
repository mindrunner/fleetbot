import { Game } from '@staratlas/sage'

import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { atlasnetLuStrategy } from './atlasnet-lu-strategy'
import { disbandAllStrategy } from './disband-all-strategy'
import { mainnetLuStrategy } from './mainnet-lu-strategy'
import { StrategyConfig } from './strategy-config'

export const getFleetStrategy = (
    map: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    switch (player.publicKey.toString()) {
        case 'k49Y5xwN7Nyi19TqDR4zbCFuAt8kgy6qMaJ6Kj1wHrn':
            return atlasnetLuStrategy(map, player, game)
        case 'AePY3wEoUFcFuXeUU9X26YK6tNKQMZovBgvY54LK2B8N':
            return mainnetLuStrategy(map, player, game)
        case 'CgHvzwGbwWv3CwLTvEgeqSKeD8EwMdTfiiCG3dFrKVVC':
            // return atlasnetFcStrategy(5)(map, player, game)
            return disbandAllStrategy(map, player, game)
        case '9KBrgWVjsmdZ3YEjcsa3wrbbJREgZgS7vDbgoz2aHaNm':
            // return atlasnetFcStrategy(5)(map, player, game)
            return disbandAllStrategy(map, player, game)
        case 'FUwHSqujzcPD44SDZYJXuk73NbkEyYQwcLMioHhpjbx2':
            // return atlasnetFcStrategy(5)(map, player, game)
            return disbandAllStrategy(map, player, game)
        case '34ghznSJCYEMrS1aC55UYZZUuxfuurA9441aKnigmYyz':
            // return atlasnetFcStrategy(5)(map, player, game)
            return disbandAllStrategy(map, player, game)
        default:
            throw new Error('Unknown strategy')
    }
}
