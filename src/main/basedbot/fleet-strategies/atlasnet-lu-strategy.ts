import { Game } from '@staratlas/sage'

import { mineBiomass } from '../fsm/configs/mine/mine-biomass.js'
import { mineCarbon } from '../fsm/configs/mine/mine-carbon.js'
import { mineCopperOre } from '../fsm/configs/mine/mine-copper-ore.js'
import { mineHydrogen } from '../fsm/configs/mine/mine-hydrogen.js'
import { mineIronOre } from '../fsm/configs/mine/mine-iron-ore.js'
import { mineLumanite } from '../fsm/configs/mine/mine-lumanite.js'
import { mineNitrogen } from '../fsm/configs/mine/mine-nitrogen.js'
import { mineRochinol } from '../fsm/configs/mine/mine-rochinol.js'
import { mineSilicia } from '../fsm/configs/mine/mine-silicia.js'
import { mineTitaniumOre } from '../fsm/configs/mine/mine-titanium-ore.js'
import { createInfoStrategy } from '../fsm/info.js'
import { createMiningStrategy } from '../fsm/mine.js'
import { Player } from '../lib/sage/state/user-account.js'
import { WorldMap } from '../lib/sage/state/world-map.js'

import { nameMapMatcher } from './name-map-matcher.js'
import { StrategyConfig } from './strategy-config.js'

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
