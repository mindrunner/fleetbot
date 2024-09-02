import { mineBiomass } from '../fsm/configs/mine-biomass'
import { mineCarbon } from '../fsm/configs/mine-carbon'
import { mineConfig } from '../fsm/configs/mine-config'
import { mineCopperOre } from '../fsm/configs/mine-copper-ore'
import { mineHydrogen } from '../fsm/configs/mine-hydrogen'
import { mineIronOre } from '../fsm/configs/mine-iron-ore'
import { mineLumanite } from '../fsm/configs/mine-lumanite'
import { mineNitrogen } from '../fsm/configs/mine-nitrogen'
import { mineRochinol } from '../fsm/configs/mine-rochinol'
import { mineSilicia } from '../fsm/configs/mine-silicia'
import { mineTitaniumOre } from '../fsm/configs/mine-titanium-ore'
import { createMiningStrategy } from '../fsm/mine'
import { Strategy } from '../fsm/strategy'
import { Player } from '../lib/sage/state/user-account'
import { mineableByCoordinates, WorldMap } from '../lib/sage/state/world-map'
import { Coordinates } from '../lib/util/coordinates'

export const atlasnetLuStrategy = (
    map: WorldMap,
    player: Player,
): Map<string, Strategy> =>
    new Map([
        ['Armadillo Fleet', createMiningStrategy(mineBiomass(map), player)],
        [
            'Barnacle Fleet',
            createMiningStrategy(
                mineConfig({
                    homeBase: Coordinates.fromNumber(-40, 30),
                    targetBase: Coordinates.fromNumber(-19, 40),
                    resource: mineableByCoordinates(
                        map,
                        Coordinates.fromNumber(-19, 40),
                    )
                        .values()
                        .next().value,
                }),
                player,
            ),
        ],
        [
            'Cobra Fleet',
            createMiningStrategy(
                mineConfig({
                    homeBase: Coordinates.fromNumber(-40, 30),
                    targetBase: Coordinates.fromNumber(-18, 23),
                    resource: mineableByCoordinates(
                        map,
                        Coordinates.fromNumber(-18, 23),
                    )
                        .values()
                        .next().value,
                }),
                player,
            ),
        ],
        ['Falcon Fleet', createMiningStrategy(mineCarbon(map), player)],
        [
            'Geoffroys Cat Fleet',
            createMiningStrategy(mineNitrogen(map), player),
        ],
        ['Gerbils Fleet', createMiningStrategy(mineSilicia(map), player)],
        ['Grasshopper Fleet', createMiningStrategy(mineLumanite(map), player)],
        ['Guanaco Fleet', createMiningStrategy(mineCopperOre(map), player)],
        ['King Cobra Fleet', createMiningStrategy(mineIronOre(map), player)],
        [
            'Pacific Sardine Fleet',
            createMiningStrategy(mineHydrogen(map), player),
        ],
        ['Porpoise Fleet', createMiningStrategy(mineRochinol(map), player)],
        ['Rabbit Fleet', createMiningStrategy(mineHydrogen(map), player)],
        [
            'Smalltooth Sawfish Fleet',
            createMiningStrategy(mineTitaniumOre(map), player),
        ],
        ['Sugar Gliders Fleet', createMiningStrategy(mineIronOre(map), player)],
        ['Turkey Fleet', createMiningStrategy(mineHydrogen(map), player)],

        ['Aardwolf Fleet', createMiningStrategy(mineBiomass(map), player)],
        [
            'Antelope Fleet',
            createMiningStrategy(
                mineConfig({
                    homeBase: Coordinates.fromNumber(-40, 30),
                    targetBase: Coordinates.fromNumber(-19, 40),
                    resource: mineableByCoordinates(
                        map,
                        Coordinates.fromNumber(-19, 40),
                    )
                        .values()
                        .next().value,
                }),
                player,
            ),
        ],
        [
            'Boa Fleet',
            createMiningStrategy(
                mineConfig({
                    homeBase: Coordinates.fromNumber(-40, 30),
                    targetBase: Coordinates.fromNumber(-18, 23),
                    resource: mineableByCoordinates(
                        map,
                        Coordinates.fromNumber(-18, 23),
                    )
                        .values()
                        .next().value,
                }),
                player,
            ),
        ],
        ['Chinchillas Fleet', createMiningStrategy(mineCarbon(map), player)],
        [
            'Fathead Sculpin Fleet',
            createMiningStrategy(mineNitrogen(map), player),
        ],
        [
            'Giant Tortoise Fleet',
            createMiningStrategy(mineSilicia(map), player),
        ],
        ['Kultarr Fleet', createMiningStrategy(mineLumanite(map), player)],
        [
            'Leopard Seal Fleet',
            createMiningStrategy(mineCopperOre(map), player),
        ],
        ['Pangolin Fleet', createMiningStrategy(mineIronOre(map), player)],
        ['Rhinoceros Fleet', createMiningStrategy(mineHydrogen(map), player)],
        ['Snow Leopard Fleet', createMiningStrategy(mineRochinol(map), player)],
        [
            'Southern White Faced Owl Fleet',
            createMiningStrategy(mineHydrogen(map), player),
        ],
        ['Turkeys Fleet', createMiningStrategy(mineTitaniumOre(map), player)],
        ['Zebra Fleet', createMiningStrategy(mineIronOre(map), player)],
        ['Guinea Fowl Fleet', createMiningStrategy(mineHydrogen(map), player)],
    ])
