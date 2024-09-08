import { Game } from '@staratlas/sage'
import { Chance } from 'chance'

import { mine } from '../fsm/configs/mine/mine'
import { createInfoStrategy } from '../fsm/info'
import { createMiningStrategy } from '../fsm/mine'
import { FleetShips } from '../lib/sage/act/create-fleet'
import { Calico, Ogrika, Pearce, ships } from '../lib/sage/ships'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { Faction, galaxySectorsData } from '../lib/util/galaxy-sectors-data'

import { nameMapMatcher } from './name-map-matcher'
import { makeStrategyMap, StrategyConfig, StrategyMap } from './strategy-config'

export const randomIntFromInterval = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const getRandomFleetForFaction = (faction: Faction): FleetShips => {
    switch (faction) {
        case Faction.MUD:
            return [
                {
                    shipMint: ships[Pearce.F4].mint,
                    count: randomIntFromInterval(1, 2),
                },
                {
                    shipMint: ships[Pearce.D9].mint,
                    count: randomIntFromInterval(2, 4),
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
            throw new Error('Unknwon Faction')
    }
}

export const atlasnetFcStrategy =
    (count: number) =>
    (map: WorldMap, player: Player, game: Game): StrategyConfig => {
        const strategyMap: StrategyMap = makeStrategyMap()
        const chance = new Chance()
        const sectors = galaxySectorsData()
            .filter((sector) => sector.closestFaction === player.faction)
            .sort((a, b) => a.name.localeCompare(b.name))

        for (let i = 0; i < count; i++) {
            strategyMap.set(`${chance.animal()} Fleet`, {
                fleet: getRandomFleetForFaction(player.faction),
                strategy: createMiningStrategy(
                    mine(
                        map,
                        player.homeCoordinates,
                        sectors[i % sectors.length].coordinates,
                    ),
                    player,
                    game,
                ),
            })
        }

        return {
            match: nameMapMatcher(createInfoStrategy()),
            map: strategyMap,
        }
    }
