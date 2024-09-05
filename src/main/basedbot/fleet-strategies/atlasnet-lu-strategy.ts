import { Game } from '@staratlas/sage'

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
    game: Game,
): Map<string, Strategy> =>
    new Map([
        [
            'Armadillo Fleet',
            createMiningStrategy(mineBiomass(map), player, game),
        ],
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
                game,
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
                game,
            ),
        ],
        ['Falcon Fleet', createMiningStrategy(mineCarbon(map), player, game)],
        [
            'Geoffroys Cat Fleet',
            createMiningStrategy(mineNitrogen(map), player, game),
        ],
        ['Gerbils Fleet', createMiningStrategy(mineSilicia(map), player, game)],
        [
            'Grasshopper Fleet',
            createMiningStrategy(mineLumanite(map), player, game),
        ],
        [
            'Guanaco Fleet',
            createMiningStrategy(mineCopperOre(map), player, game),
        ],
        [
            'King Cobra Fleet',
            createMiningStrategy(mineIronOre(map), player, game),
        ],
        [
            'Pacific Sardine Fleet',
            createMiningStrategy(mineHydrogen(map), player, game),
        ],
        [
            'Porpoise Fleet',
            createMiningStrategy(mineRochinol(map), player, game),
        ],
        ['Rabbit Fleet', createMiningStrategy(mineHydrogen(map), player, game)],
        [
            'Smalltooth Sawfish Fleet',
            createMiningStrategy(mineTitaniumOre(map), player, game),
        ],
        [
            'Sugar Gliders Fleet',
            createMiningStrategy(mineIronOre(map), player, game),
        ],
        ['Turkey Fleet', createMiningStrategy(mineHydrogen(map), player, game)],

        [
            'Aardwolf Fleet',
            createMiningStrategy(mineBiomass(map), player, game),
        ],
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
                game,
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
                game,
            ),
        ],
        [
            'Chinchillas Fleet',
            createMiningStrategy(mineCarbon(map), player, game),
        ],
        [
            'Fathead Sculpin Fleet',
            createMiningStrategy(mineNitrogen(map), player, game),
        ],
        [
            'Giant Tortoise Fleet',
            createMiningStrategy(mineSilicia(map), player, game),
        ],
        [
            'Kultarr Fleet',
            createMiningStrategy(mineLumanite(map), player, game),
        ],
        [
            'Leopard Seal Fleet',
            createMiningStrategy(mineCopperOre(map), player, game),
        ],
        [
            'Pangolin Fleet',
            createMiningStrategy(mineIronOre(map), player, game),
        ],
        [
            'Rhinoceros Fleet',
            createMiningStrategy(mineHydrogen(map), player, game),
        ],
        [
            'Snow Leopard Fleet',
            createMiningStrategy(mineRochinol(map), player, game),
        ],
        [
            'Southern White Faced Owl Fleet',
            createMiningStrategy(mineHydrogen(map), player, game),
        ],
        [
            'Turkeys Fleet',
            createMiningStrategy(mineTitaniumOre(map), player, game),
        ],
        ['Zebra Fleet', createMiningStrategy(mineIronOre(map), player, game)],
        [
            'Guinea Fowl Fleet',
            createMiningStrategy(mineHydrogen(map), player, game),
        ],
    ])
