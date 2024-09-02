import { Strategy } from '../fsm/strategy'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'

import { atlasnetFcStrategy } from './atlasnet-fc-strategy'
import { atlasnetLuStrategy } from './atlasnet-lu-strategy'
import { mainnetLuStrategy } from './mainnet-lu-strategy'

export const getFleetStrategy = (
    map: WorldMap,
    player: Player,
): Map<string, Strategy> => {
    switch (player.publicKey.toString()) {
        case 'k49Y5xwN7Nyi19TqDR4zbCFuAt8kgy6qMaJ6Kj1wHrn':
            return atlasnetLuStrategy(map, player)
        case 'AePY3wEoUFcFuXeUU9X26YK6tNKQMZovBgvY54LK2B8N':
            return mainnetLuStrategy(map, player)
        case 'CgHvzwGbwWv3CwLTvEgeqSKeD8EwMdTfiiCG3dFrKVVC':
            return atlasnetFcStrategy(100)(map, player)
        default:
            throw new Error('Unknown strategy')
    }
}