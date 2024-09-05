import { Game } from '@staratlas/sage'

import { Strategy } from '../fsm/strategy'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { atlasnetFcStrategy } from './atlasnet-fc-strategy'
import { atlasnetLuStrategy } from './atlasnet-lu-strategy'
import { mainnetLuStrategy } from './mainnet-lu-strategy'

export const getFleetStrategy = (
    map: WorldMap,
    player: Player,
    game: Game,
): Map<string, Strategy> => {
    switch (player.publicKey.toString()) {
        case 'k49Y5xwN7Nyi19TqDR4zbCFuAt8kgy6qMaJ6Kj1wHrn':
            return atlasnetLuStrategy(map, player, game)
        case 'AePY3wEoUFcFuXeUU9X26YK6tNKQMZovBgvY54LK2B8N':
            return mainnetLuStrategy(map, player, game)
        case 'CgHvzwGbwWv3CwLTvEgeqSKeD8EwMdTfiiCG3dFrKVVC':
            return atlasnetFcStrategy(100)(map, player, game, 'basedbot-mud')
        case '9KBrgWVjsmdZ3YEjcsa3wrbbJREgZgS7vDbgoz2aHaNm':
            return atlasnetFcStrategy(100)(map, player, game, 'basedbot-ustur')
        case 'FUwHSqujzcPD44SDZYJXuk73NbkEyYQwcLMioHhpjbx2':
            return atlasnetFcStrategy(100)(map, player, game, 'basedbot-oni')
        case '34ghznSJCYEMrS1aC55UYZZUuxfuurA9441aKnigmYyz':
            return atlasnetFcStrategy(10)(map, player, game, 'le.local')
        default:
            throw new Error('Unknown strategy')
    }
}
