import { Game } from '@staratlas/sage'

import { mine } from '../fsm/configs/mine/mine'
import { createInfoStrategy } from '../fsm/info'
import { createMiningStrategy } from '../fsm/mine'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { galaxySectorsData } from '../lib/util/galaxy-sectors-data'

import { nameMapMatcher } from './name-map-matcher'
import { makeStrategyMap, StrategyConfig, StrategyMap } from './strategy-config'

export const atlasnetFcStrategy =
    (count: number) =>
    (
        map: WorldMap,
        player: Player,
        game: Game,
        namePrefix: string,
    ): StrategyConfig => {
        const strategyMap: StrategyMap = makeStrategyMap()
        const sectors = galaxySectorsData()
            .filter((sector) => sector.closestFaction === player.faction)
            .sort((a, b) => a.name.localeCompare(b.name))

        for (let i = 0; i < count; i++) {
            strategyMap.set(
                `${namePrefix}-${i}`,
                createMiningStrategy(
                    mine(
                        map,
                        player.homeCoordinates,
                        sectors[i % sectors.length].coordinates,
                    ),
                    player,
                    game,
                ),
            )
        }

        return {
            match: nameMapMatcher(createInfoStrategy()),
            map: strategyMap,
        }
    }
