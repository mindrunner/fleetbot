import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import {
    Fleet,
    Game,
    getCleanPodsByStarbasePlayerAccounts,
    getPodCleanupInstructions,
    Starbase,
} from '@staratlas/sage'
import BN from 'bn.js'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { sleep } from '../../service/sleep'
import { connection } from '../../service/sol'
import { sendAndConfirmInstructions } from '../../service/sol/send-and-confirm-tx'
import { keyPair } from '../../service/wallet'

import { getFleetStrategy } from './fleet-strategies/get-fleet-strategy'
import { StrategyConfig } from './fleet-strategies/strategy-config'
import { createInfoStrategy } from './fsm/info'
import { programs } from './lib/programs'
import { createFleet, FleetShip } from './lib/sage/act/create-fleet'
import { depositCargo } from './lib/sage/act/deposit-cargo'
import { ensureShips } from './lib/sage/act/deposit-ship'
import { getCargoStatsDefinition } from './lib/sage/state/cargo-stats-definition'
import { sageGame } from './lib/sage/state/game'
import { settleFleet } from './lib/sage/state/settle-fleet'
import { getStarbasePlayer } from './lib/sage/state/starbase-player'
import { getPlayerContext, Player } from './lib/sage/state/user-account'
import {
    FleetInfo,
    getFleetInfo,
    getUserFleets,
} from './lib/sage/state/user-fleets'
import { getMapContext, WorldMap } from './lib/sage/state/world-map'
// eslint-disable-next-line import/max-dependencies
import { getName } from './lib/sage/util'

// eslint-disable-next-line require-await
export const create = async (): Promise<void> => {
    logger.info('Starting basedbot...')
}

// eslint-disable-next-line require-await
export const stop = async (): Promise<void> => {
    logger.info('Stopping basedbot')
}

type BotConfig = {
    player: Player
    map: WorldMap
    fleetStrategies: StrategyConfig
}

const applyStrategy = (
    fleetInfo: FleetInfo,
    config: StrategyConfig,
): Promise<void> => {
    const { strategy } = config.match(fleetInfo.fleetName, config.map)

    if (!strategy) {
        logger.warn(
            `No strategy for fleet: ${fleetInfo.fleetName}. Using Info Strategy...`,
        )

        return createInfoStrategy().apply(fleetInfo)
    }

    return strategy.apply(fleetInfo)
}

export const getTokenBalance = async (
    account: PublicKey,
    mint: PublicKey,
): Promise<BN> => {
    const allTokenAccounts = await getParsedTokenAccountsByOwner(
        connection,
        account,
        TOKEN_PROGRAM_ID,
    )

    const sourceTokenAccount = getAssociatedTokenAddressSync(
        mint,
        account,
        true,
    )
    const [mintTokenAccount] = allTokenAccounts.filter((it) =>
        it.address.equals(sourceTokenAccount),
    )

    if (!mintTokenAccount) {
        logger.warn('Token account not found, assuming empty balance.')
    }

    return new BN(mintTokenAccount ? mintTokenAccount.amount.toString() : 0)
}

const importR4 = async (player: Player, game: Game): Promise<void> => {
    await Promise.all(
        [
            game.data.mints.food,
            game.data.mints.ammo,
            game.data.mints.fuel,
            game.data.mints.repairKit,
        ].map(async (mint) => {
            const amountAtOrigin = await getTokenBalance(
                player.signer.publicKey(),
                mint,
            )

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
    fleetStrategies: StrategyConfig,
): Promise<void> => {
    const existingFleets = fleets.map(getName)
    const wantedFleets = Array.from(fleetStrategies.map.keys())

    const neededFleets = wantedFleets.filter((f) => !existingFleets.includes(f))

    if (neededFleets.length > 0) {
        logger.info('Creating fleets:', neededFleets)
    }

    const neededShips = new Map<string, number>()

    neededFleets.forEach((fleetName) => {
        const fleetStrategy = fleetStrategies.map.get(fleetName)!

        fleetStrategy.fleet?.forEach((fleetShip) => {
            const curr = neededShips.get(fleetShip.shipMint.toBase58()) ?? 0

            neededShips.set(
                fleetShip.shipMint.toBase58(),
                curr + fleetShip.count,
            )
        })
    })

    const shipMints = Array.from(neededShips.keys())
        .map((mint) => [
            {
                count: neededShips.get(mint) ?? 0,
                shipMint: new PublicKey(mint),
            } as FleetShip,
        ])
        .flat()

    await ensureShips(player, game, player.homeStarbase, shipMints)

    await Promise.all(
        neededFleets.map((fleetName) => {
            const fleetStrategy = fleetStrategies.map.get(fleetName)!

            if (!fleetStrategy.fleet) {
                logger.info('Cannot ensure fleet without config.')

                return Promise.resolve()
            }

            return createFleet(
                player,
                game,
                player.homeStarbase,
                fleetStrategy.fleet!,
                fleetName,
            )
        }),
    )
}

const cleanupPods = async (player: Player, game: Game, starbase: Starbase) => {
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const podCleanup = await getCleanPodsByStarbasePlayerAccounts(
        connection,
        programs.cargo,
        starbasePlayer.key,
    )
    const [cargoStatsDefinition] = await getCargoStatsDefinition()

    if (!podCleanup) {
        logger.info('Nothing to Clean up')

        return
    }

    const ixs = getPodCleanupInstructions(
        podCleanup,
        programs.sage,
        programs.cargo,
        starbasePlayer.key,
        starbase.key,
        player.profile.key,
        player.profileFaction.key,
        cargoStatsDefinition.key,
        game.key,
        game.data.gameState,
        player.signer,
        0,
    )

    await sendAndConfirmInstructions(await ixReturnsToIxs(ixs, player.signer))
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

    await cleanupPods(player, game, player.homeStarbase)

    await Promise.all([
        importR4(player, game),
        ensureFleets(player, game, fleets, botConfig.fleetStrategies),
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
