import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { getParsedTokenAccountsByOwner } from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'
import BN from 'bn.js'

import { Sentry } from '../../sentry'

import { logger } from '../../logger'
import { sleep } from '../../service/sleep'
import { connection } from '../../service/sol'
import { keyPair } from '../../service/wallet'

import { getFleetStrategy } from './fleet-strategies/get-fleet-strategy'
import { createInfoStrategy } from './fsm/info'
import { Strategy } from './fsm/strategy'
import { createFleet } from './lib/sage/act/create-fleet'
import { depositCargo } from './lib/sage/act/deposit-cargo'
import { settleFleet } from './lib/sage/state/settle-fleet'
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

const importR4 = async (player: Player): Promise<void> => {
    await Promise.all(
        [
            player.game.data.mints.food,
            player.game.data.mints.ammo,
            player.game.data.mints.fuel,
            player.game.data.mints.repairKit,
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
                    player.homeStarbase,
                    mint,
                    amountAtOrigin,
                )
            }
        }),
    )
}

const ensureFleets = async (
    fleets: Array<Fleet>,
    botConfig: BotConfig,
): Promise<void> => {
    const existingFleets = fleets.map(getName)
    const wantedFleets = Array.from(botConfig.fleetStrategies.keys())

    const neededFleets = wantedFleets.filter((f) => !existingFleets.includes(f))

    if (neededFleets.length > 0) {
        logger.info('Creating fleets:', neededFleets)
    }

    const fleetMint = new PublicKey(
        '9tGU2Mvtvvr2n7Fjmw3zbsdr5YrfGbLtPxR31bi5hTA4',
    )

    await Promise.all(
        neededFleets.map((fleetName) =>
            createFleet(
                botConfig.player,
                botConfig.player.homeStarbase,
                fleetMint,
                fleetName,
                1,
            ),
        ),
    )
}

const basedbot = async (botConfig: BotConfig) => {
    logger.info(
        '-------------------------------------------------------------------------------------',
    )
    const { player, map } = botConfig
    const fleets = await getUserFleets(player)
    const fleetInfos = await Promise.all(
        fleets.map((f) => getFleetInfo(f, player, map)),
    )

    await Promise.all([importR4(player), ensureFleets(fleets, botConfig)])

    await Promise.all(
        fleetInfos.map((fleetInfo) => settleFleet(fleetInfo, player)),
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
    const map = await getMapContext(player.game)

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await basedbot({
                player,
                map,
                fleetStrategies: getFleetStrategy(map, player),
            })
        } catch (e) {
            Sentry.captureException(e)
            logger.error(e)
        } finally {
            await sleep(10000)
        }
    }
}
