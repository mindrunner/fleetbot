import { Game } from '@staratlas/sage'

import { mineBiomass } from '../fsm/configs/mine/mine-biomass'
import { mineCarbon } from '../fsm/configs/mine/mine-carbon'
import { mineConfig } from '../fsm/configs/mine/mine-config'
import { mineCopperOre } from '../fsm/configs/mine/mine-copper-ore'
import { mineHydrogen } from '../fsm/configs/mine/mine-hydrogen'
import { mineIronOre } from '../fsm/configs/mine/mine-iron-ore'
import { mineLumanite } from '../fsm/configs/mine/mine-lumanite'
import { mineNitrogen } from '../fsm/configs/mine/mine-nitrogen'
import { mineRochinol } from '../fsm/configs/mine/mine-rochinol'
import { mineSilicia } from '../fsm/configs/mine/mine-silicia'
import { mineTitaniumOre } from '../fsm/configs/mine/mine-titanium-ore'
import { createInfoStrategy } from '../fsm/info'
import { createMiningStrategy } from '../fsm/mine'
import { Player } from '../lib/sage/state/user-account'
import { mineableByCoordinates, WorldMap } from '../lib/sage/state/world-map'
import { Coordinates } from '../lib/util/coordinates'

import { nameMapMatcher } from './name-map-matcher'
import { StrategyConfig } from './strategy-config'

export const atlasnetLuStrategy = (
    map: WorldMap,
    player: Player,
    game: Game,
): StrategyConfig => {
    return {
        match: nameMapMatcher(createInfoStrategy()),
        map: new Map([
            [
                'Armadillo Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineBiomass(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Barnacle Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
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
                },
            ],
            [
                'Cobra Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
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
                },
            ],
            [
                'Falcon Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineCarbon(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Geoffroys Cat Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineNitrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Gerbils Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineSilicia(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Grasshopper Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineLumanite(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Guanaco Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineCopperOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'King Cobra Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineIronOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Pacific Sardine Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Porpoise Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineRochinol(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Rabbit Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Smalltooth Sawfish Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineTitaniumOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Sugar Gliders Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineIronOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Turkey Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],

            [
                'Aardwolf Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineBiomass(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Antelope Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
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
                },
            ],
            [
                'Boa Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
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
                },
            ],
            [
                'Chinchillas Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineCarbon(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Fathead Sculpin Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineNitrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Giant Tortoise Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineSilicia(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Kultarr Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineLumanite(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Leopard Seal Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineCopperOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Pangolin Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineIronOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Rhinoceros Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Snow Leopard Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineRochinol(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Southern White Faced Owl Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Turkeys Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineTitaniumOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Zebra Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineIronOre(map),
                        player,
                        game,
                    ),
                },
            ],
            [
                'Guinea Fowl Fleet',
                {
                    fleet: null,
                    strategy: createMiningStrategy(
                        mineHydrogen(map),
                        player,
                        game,
                    ),
                },
            ],
        ]),
    }
}
