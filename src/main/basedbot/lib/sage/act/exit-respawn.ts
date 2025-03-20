import { getAssociatedTokenAddressSync } from '@solana/spl-token'
// eslint-disable-next-line import/named
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { exitRespawnIx } from '../ix/exit-respawn'
import { forceDropFleetCargoIx } from '../ix/force-drop-fleet-cargo'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { getCargoType } from '../state/cargo-types'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

import { getFleetCargoHold } from './load-cargo'

export const exitRespawn = async (
    fleetInfo: FleetInfo,
    starbase: Starbase,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.Respawn) {
        logger.warn('Fleet is not respawning, cannot Exit Respawn')

        return
    }

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const [cargoStatsDefinition] = await getCargoStatsDefinition()

    const ixs: Array<InstructionReturn> = []

    const cargoMints = player.cargoTypes.map((ct) => ct.data.mint)

    const mintAccountInfos = (
        await Promise.all(
            cargoMints.map(async (mint) => {
                const cargoPod = getFleetCargoHold(mint, game, fleetInfo)
                const tokenFrom = getAssociatedTokenAddressSync(
                    mint,
                    cargoPod,
                    true,
                )

                return {
                    mint,
                    accountInfo: await connection.getAccountInfo(tokenFrom),
                }
            }),
        )
    ).reduce(
        (acc, curr) => acc.set(curr.mint.toBase58(), curr.accountInfo),
        new Map<string, AccountInfo<Buffer> | null>(),
    )

    for (const key of cargoMints) {
        const mint = new PublicKey(key)
        const cargoType = getCargoType(player.cargoTypes, game, mint)

        const cargoPod = getFleetCargoHold(mint, game, fleetInfo)
        const tokenFrom = getAssociatedTokenAddressSync(mint, cargoPod, true)

        const accountInfo = mintAccountInfos.get(mint.toBase58())

        if (accountInfo) {
            ixs.push(
                forceDropFleetCargoIx(
                    fleetInfo,
                    game,
                    cargoStatsDefinition,
                    cargoPod,
                    cargoType.key,
                    tokenFrom,
                    mint,
                    programs,
                ),
            )
        }
    }
    ixs.push(
        exitRespawnIx(
            fleetInfo,
            player,
            game,
            starbase,
            starbasePlayer,
            programs,
        ),
    )
    await ixReturnsToIxs(ixs, player.signer).then(sendAndConfirmInstructions)
}
