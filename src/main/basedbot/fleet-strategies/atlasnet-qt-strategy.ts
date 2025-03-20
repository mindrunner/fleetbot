import { Game } from '@staratlas/sage'
import { Chance } from 'chance'

import { createInfoStrategy } from '../fsm/info'
import { createScanningStrategy, scan } from '../fsm/scan'
import { FleetShips } from '../lib/sage/act/create-fleet'
import { Calico, Ogrika, Pearce, ships } from '../lib/sage/ships'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { Faction } from '../lib/util/galaxy-sectors-data'

import { nameMapMatcher } from './name-map-matcher'
import { makeStrategyMap, StrategyConfig, StrategyMap } from './strategy-config'

export const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const getRandomFleetForFaction = (faction: Faction): FleetShips => {
    switch (faction) {
        case Faction.MUD:
            return [
                {
                    shipMint: ships[Pearce.D9].mint,
                    count: randomIntFromInterval(1, 2),
                },
                {
                    shipMint: ships[Pearce.F4].mint,
                    count: randomIntFromInterval(2, 3),
                },
            ]
        case Faction.ONI:
            return [
                {
                    shipMint: ships[Ogrika.Niruch].mint,
                    count: randomIntFromInterval(1, 2),
                },
                {
                    shipMint: ships[Ogrika.Sunpaa].mint,
                    count: randomIntFromInterval(2, 4),
                },
            ]
        case Faction.UST:
            return [
                {
                    shipMint: ships[Calico.Guardian].mint,
                    count: randomIntFromInterval(1, 2),
                },
                {
                    shipMint: ships[Calico.Evac].mint,
                    count: randomIntFromInterval(2, 4),
                },
            ]
        default:
            throw new Error('Unknown Faction')
    }
}

const getRandomFleetName = (chance: Chance.Chance, maxLen: number): string => {
    const getName = () => `${chance.animal()} Fleet`

    let name = getName()

    while (name.length > maxLen) {
        name = getName()
    }

    return name
}

// const randomSector = (chance: Chance.Chance, sectors: Array<SectorInfo>) =>
//     sectors[chance.integer({ min: 0, max: sectors.length - 1 })].coordinates

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
        // const sectors = galaxySectorsData()
        //     .filter((sector) => sector.closestFaction === player.faction)
        //     .filter((sector) =>
        //         [
        //             'MUD-2',
        //             'MUD-3',
        //             'MUD-4',
        //             'MUD-5',
        //             'ONI-2',
        //             'ONI-3',
        //             'ONI-4',
        //             'ONI-5',
        //             'UST-2',
        //             'UST-3',
        //             'UST-4',
        //             'UST-5',
        //         ].includes(sector.name),
        //     )
        //     .sort((a, b) => a.name.localeCompare(b.name))

        for (let i = 0; i < count; i++) {
            strategyMap.set(getRandomFleetName(chance, 32), {
                fleet: getRandomFleetForFaction(player.faction),
                strategy: createScanningStrategy(scan(map), player, game),
            })

            // strategyMap.set(getRandomFleetName(chance, 32), {
            //     fleet: getRandomFleetForFaction(player.faction),
            //     strategy: createMiningStrategy(
            //         mine(map, home, target),
            //         player,
            //         game,
            //     ),
            // })
            // // No transport fleet needed if mining fleet uses CSS as home base.
            // if (!home.equals(player.homeCoordinates)) {
            //     strategyMap.set(getRandomFleetName(chance, 32), {
            //         fleet: getRandomFleetForFaction(player.faction),
            //         strategy: createTransportStrategy(
            //             transport(
            //                 map,
            //                 player.homeCoordinates,
            //                 home,
            //                 new Set([
            //                     game.data.mints.fuel,
            //                     game.data.mints.ammo,
            //                     game.data.mints.food,
            //                     game.data.mints.repairKit,
            //                 ]),
            //             ),
            //             player,
            //             game,
            //         ),
            //     })
            // }
        }

        return {
            match: nameMapMatcher(createInfoStrategy()),
            map: strategyMap,
        }
    }
