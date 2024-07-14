import { Sentry } from '../../sentry'

import { config } from '../../config'
import { logger } from '../../logger'
import { sleep } from '../../service/sleep'
import { keyPair } from '../../service/wallet'

import { mineBiomass } from './fsm/configs/mine-biomass'
import { mineCarbon } from './fsm/configs/mine-carbon'
import { mineConfig } from './fsm/configs/mine-config'
import { mineCopperOre } from './fsm/configs/mine-copper-ore'
import { mineHydrogen } from './fsm/configs/mine-hydrogen'
import { mineIronOre } from './fsm/configs/mine-iron-ore'
import { mineLumanite } from './fsm/configs/mine-lumanite'
import { mineNitrogen } from './fsm/configs/mine-nitrogen'
import { mineRochinol } from './fsm/configs/mine-rochinol'
import { mineSilicia } from './fsm/configs/mine-silicia'
import { mineTitaniumOre } from './fsm/configs/mine-titanium-ore'
import { createMiningStrategy } from './fsm/mine'
import { Strategy } from './fsm/strategy'
import { settleFleet } from './lib/sage/state/settle-fleet'
import { getPlayerContext, Player } from './lib/sage/state/user-account'
import {
    FleetInfo,
    getFleetInfo,
    getUserFleets,
} from './lib/sage/state/user-fleets'
import {
    getMapContext,
    mineableByCoordinates,
    WorldMap,
} from './lib/sage/state/world-map'
import { Coordinates } from './lib/util/coordinates'

// eslint-disable-next-line require-await
export const create = async (): Promise<void> => {
    logger.info('Starting basedbot...')
}

// eslint-disable-next-line require-await
export const stop = async (): Promise<void> => {
    logger.info('Stopping basedbot')
}

type FleetStrategies = Map<string, Strategy>

type BotConfig = {
    player: Player
    map: WorldMap
    fleetStrategies: FleetStrategies
}

const applyStrategy = (
    fleetInfo: FleetInfo,
    fleetStrategies: FleetStrategies,
): Promise<void> => {
    const strategy = fleetStrategies.get(fleetInfo.fleetName)

    if (!strategy) {
        return Promise.resolve()
        //     logger.info(`No strategy for fleet: ${fleetInfo.fleetName}. Lazily loading Info Strategy...`)
        //     const infoStrategy = createInfoStrategy()
        //
        //     fleetStrategies.set(fleetInfo.fleetName, infoStrategy)
        //
        //     return infoStrategy.send(fleetInfo)
    }

    return strategy.send(fleetInfo)
}

const basedbot = async (botConfig: BotConfig) => {
    const { player, map } = botConfig
    const fleets = await getUserFleets(player)
    const fleetInfos = await Promise.all(
        fleets.map((f) => getFleetInfo(f, player, map)),
    )

    await Promise.all(
        fleetInfos.map((fleetInfo) => settleFleet(fleetInfo, player, map)),
    )
    await Promise.all(
        fleetInfos.map((fleetInfo) =>
            applyStrategy(fleetInfo, botConfig.fleetStrategies),
        ),
    )
}

export const start = async (): Promise<void> => {
    const player = await getPlayerContext(keyPair.publicKey, keyPair)
    const map = await getMapContext(player.game)

    const fleetStrategies: Map<string, Strategy> =
        config.sol.rpcEndpoint.includes('atlasnet')
            ? new Map([
                  [
                      'Atlantic Goliath Grouper Fleet',
                      createMiningStrategy(mineBiomass(map), player),
                  ],
                  [
                      'Baboon Fleet',
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
                      'Silkworm Fleet',
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
                  [
                      'Broadclub Cuttlefish Fleet',
                      createMiningStrategy(mineCarbon(map), player),
                  ],
                  [
                      'Elephant Fleet',
                      createMiningStrategy(mineNitrogen(map), player),
                  ],
                  [
                      'Gelada Fleet',
                      createMiningStrategy(mineSilicia(map), player),
                  ],
                  [
                      'Hectors Dolphin Fleet',
                      createMiningStrategy(mineLumanite(map), player),
                  ],
                  [
                      'Groundhog Fleet',
                      createMiningStrategy(mineCopperOre(map), player),
                  ],
                  [
                      'Lion Fleet',
                      createMiningStrategy(mineIronOre(map), player),
                  ],
                  [
                      'Rock Hyrax Fleet',
                      createMiningStrategy(mineHydrogen(map), player),
                  ],
                  [
                      'Snakes Fleet',
                      createMiningStrategy(mineRochinol(map), player),
                  ],
                  [
                      'Sugar Gliders Fleet',
                      createMiningStrategy(mineHydrogen(map), player),
                  ],
                  [
                      'Tortoise Fleet',
                      createMiningStrategy(mineTitaniumOre(map), player),
                  ],
                  [
                      'Cotton Rat Fleet',
                      createMiningStrategy(mineIronOre(map), player),
                  ],
                  [
                      'Greenland Shark Fleet',
                      createMiningStrategy(mineHydrogen(map), player),
                  ],
              ])
            : new Map([
                  [
                      'Bearded Dragon Fleet',
                      createMiningStrategy(mineLumanite(map), player),
                  ],
                  [
                      'Deer Mouse Fleet',
                      createMiningStrategy(mineBiomass(map), player),
                  ],
                  [
                      'Emu Fleet',
                      createMiningStrategy(mineNitrogen(map), player),
                  ],
                  [
                      'Toad Fleet',
                      createMiningStrategy(mineSilicia(map), player),
                  ],
                  [
                      'Tortoise Fleet',
                      createMiningStrategy(mineHydrogen(map), player),
                  ],
              ])

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await basedbot({ player, map, fleetStrategies })
        } catch (e) {
            Sentry.captureException(e)
            logger.error(e)
        } finally {
            await sleep(10000)
        }
    }
}
