import { Game } from '@staratlas/sage'
import { Chance } from 'chance'

import { mine } from '../fsm/configs/mine/mine.js'
import { createInfoStrategy } from '../fsm/info.js'
import { createMiningStrategy } from '../fsm/mine.js'
import { createTransportStrategy, transport } from '../fsm/transport.js'
import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'
import { galaxySectorsData, SectorInfo } from '../lib/util/galaxy-sectors-data.js'
import { getRandomFleet } from '../lib/util/get-random-fleet.js'

import { nameMapMatcher } from './name-map-matcher.js'
import { getRandomFleetName } from './random-fleet-name.js'
import { makeStrategyMap, StrategyConfig, StrategyMap } from './strategy-config.js'

const randomSector = (chance: Chance.Chance, sectors: Array<SectorInfo>) =>
    sectors[chance.integer({ min: 0, max: sectors.length - 1 })].coordinates

export const atlasnetQtStrategy =
    (count: number) =>
    (
        map: WorldMap,
        player: Player,
        game: Game,
        seed: string = 'basedbot',
    ): StrategyConfig => {
        const strategyMap: StrategyMap = makeStrategyMap()
        const chance = new Chance(seed)
        const sectors = galaxySectorsData()
            .filter((sector) => sector.closestFaction === player.faction)
            .filter((sector) =>
                [
                    'MUD-2',
                    'MUD-3',
                    'MUD-4',
                    'MUD-5',
                    'ONI-2',
                    'ONI-3',
                    'ONI-4',
                    'ONI-5',
                    'UST-2',
                    'UST-3',
                    'UST-4',
                    'UST-5',
                ].includes(sector.name),
            )
            .sort((a, b) => a.name.localeCompare(b.name))

        for (let i = 0; i < count; i++) {
            const home = randomSector(chance, sectors)
            const target = randomSector(chance, sectors)

            strategyMap.set(getRandomFleetName(chance, 32, player.faction), {
                fleet: getRandomFleet(player, 'mine'),
                strategy: createMiningStrategy(
                    mine(map, home, target, chance),
                    player,
                    game,
                ),
            })
            // No transport fleet needed if mining fleet uses CSS as home base.
            if (!home.equals(player.homeCoordinates)) {
                strategyMap.set(
                    getRandomFleetName(chance, 32, player.faction),
                    {
                        fleet: getRandomFleet(player, 'transport'),
                        strategy: createTransportStrategy(
                            transport(
                                map,
                                player.homeCoordinates,
                                home,
                                new Set([
                                    game.data.mints.fuel,
                                    game.data.mints.ammo,
                                    game.data.mints.food,
                                    game.data.mints.repairKit,
                                ]),
                            ),
                            player,
                            game,
                        ),
                    },
                )
            }
        }

        return {
            match: nameMapMatcher(createInfoStrategy()),
            map: strategyMap,
        }
    }
