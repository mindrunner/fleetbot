import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { getParsedTokenAccountsByOwner } from '@staratlas/data-source'
import { Fleet, Game, Ship } from '@staratlas/sage'
import BN from 'bn.js'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { sleep } from '../../service/sleep'
import { connection } from '../../service/sol'
import { keyPair } from '../../service/wallet'

import { getFleetStrategy } from './fleet-strategies/get-fleet-strategy'
import { createInfoStrategy } from './fsm/info'
import { Strategy } from './fsm/strategy'
import { programs } from './lib/programs'
import { createFleet } from './lib/sage/act/create-fleet'
import { depositCargo } from './lib/sage/act/deposit-cargo'
import { ensureShips } from './lib/sage/act/deposit-ship'
import { Fimbul, ships } from './lib/sage/ships'
import { sageGame } from './lib/sage/state/game'
import { settleFleet } from './lib/sage/state/settle-fleet'
import { getShipByMint } from './lib/sage/state/starbase-player'
import { getPlayerContext, Player } from './lib/sage/state/user-account'
import {
    FleetInfo,
    getFleetInfo,
    getUserFleets,
} from './lib/sage/state/user-fleets'
import { getMapContext, WorldMap } from './lib/sage/state/world-map'
import { getName } from './lib/sage/util'
// eslint-disable-next-line import/max-dependencies

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
        logger.info(
            `No strategy for fleet: ${fleetInfo.fleetName}. Lazily loading Info Strategy...`,
        )
        const infoStrategy = createInfoStrategy()

        fleetStrategies.set(fleetInfo.fleetName, infoStrategy)

        return infoStrategy.send(fleetInfo)
    }

    return strategy.send(fleetInfo)
}

const importR4 = async (player: Player, game: Game): Promise<void> => {
    await Promise.all(
        [
            game.data.mints.food,
            game.data.mints.ammo,
            game.data.mints.fuel,
            game.data.mints.repairKit,
        ].map(async (mint) => {
            //TODO: Make it easier to get the amount of a token
            //      This is being used in multiple places
            const allTokenAccounts = await getParsedTokenAccountsByOwner(
                connection,
                player.signer.publicKey(),
                TOKEN_PROGRAM_ID,
            )

            const sourceTokenAccount = getAssociatedTokenAddressSync(
                mint,
                player.signer.publicKey(),
                true,
            )
            const [mintTokenAccount] = allTokenAccounts.filter((it) =>
                it.address.equals(sourceTokenAccount),
            )
            const amountAtOrigin = new BN(mintTokenAccount.amount.toString())

            if (amountAtOrigin.gtn(0)) {
                logger.info(
                    `Importing R4 for ${mint.toBase58()}: ${amountAtOrigin}`,
                )

                await depositCargo(
                    player,
                    game,
                    player.homeStarbase,
                    mint,
                    amountAtOrigin,
                )
            }
        }),
    )
}

const ensureFleets = async (
    player: Player,
    game: Game,
    fleets: Array<Fleet>,
    botConfig: BotConfig,
    ship: Ship,
    count: number,
): Promise<void> => {
    const existingFleets = fleets.map(getName)
    const wantedFleets = Array.from(botConfig.fleetStrategies.keys())

    const neededFleets = wantedFleets.filter((f) => !existingFleets.includes(f))

    if (neededFleets.length > 0) {
        logger.info('Creating fleets:', neededFleets)
    }

    await Promise.all(
        neededFleets.map((fleetName) => {
            return ensureShips(
                player,
                game,
                player.homeStarbase,
                ship,
                new BN(count),
            ).then(() =>
                createFleet(
                    botConfig.player,
                    game,
                    botConfig.player.homeStarbase,
                    ship,
                    fleetName,
                    count,
                ),
            )
        }),
    )
}

const basedbot = async (botConfig: BotConfig) => {
    logger.info(
        '-------------------------------------------------------------------------------------',
    )
    const { player, map } = botConfig
    const [fleets, game] = await Promise.all([
        getUserFleets(player),
        sageGame(),
    ])
    const fleetInfos = await Promise.all(
        fleets.map((f) => getFleetInfo(f, player, map)),
    )

    const shipMint = ships[Fimbul.Lowbie].mint
    const ship = await getShipByMint(shipMint, game, programs)

    await Promise.all([
        importR4(player, game),
        ensureFleets(player, game, fleets, botConfig, ship, 5),
    ])

    await Promise.all(
        fleetInfos.map((fleetInfo) => settleFleet(fleetInfo, player, game)),
    )
    await Promise.all(
        fleetInfos.map((fleetInfo) =>
            applyStrategy(fleetInfo, botConfig.fleetStrategies),
        ),
    )
    logger.info(
        '-------------------------------------------------------------------------------------',
    )
}

export const start = async (): Promise<void> => {
    const player = await getPlayerContext(keyPair.publicKey, keyPair)
    const game = await sageGame()
    const map = await getMapContext(game)
    const fleetStrategies = getFleetStrategy(map, player, game)

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await basedbot({
                player,
                map,
                fleetStrategies,
            })
        } catch (e) {
            Sentry.captureException(e)
            logger.error(e)
        } finally {
            await sleep(10000)
        }
    }
}
