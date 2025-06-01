import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol/index.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'
import { unloadCargoIx } from '../ix/unload-cargo.js'
import { getCargoType } from '../state/cargo-types.js'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates.js'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const unloadAllCargo = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
    game: Game,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    const hold = fleetInfo.fleet.data.cargoHold

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const cargoPodTo = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )

    const fleetTokenAccounts = await getParsedTokenAccountsByOwner(
        connection,
        hold,
    )

    const tokenAddresses: string[] = []
    const withdrawInstructions: InstructionReturn[] = []

    for (let i = 0; i < fleetTokenAccounts.length; i++) {
        const fleetTokenAccount = fleetTokenAccounts[i]
        const tokenToResult = createAssociatedTokenAccountIdempotent(
            fleetTokenAccount.mint,
            (await getCargoPodsForStarbasePlayer(starbasePlayer, programs)).key,
            true,
        )

        if (!tokenAddresses.includes(tokenToResult.address.toBase58())) {
            tokenAddresses.push(tokenToResult.address.toBase58())
            withdrawInstructions.push(tokenToResult.instructions)
        }

        const cargoType = getCargoType(
            player.cargoTypes,
            game,
            fleetTokenAccount.mint,
        )

        withdrawInstructions.push(
            unloadCargoIx(
                fleetInfo,
                player,
                game,
                starbase,
                starbasePlayer,
                fleetInfo.fleet.data.cargoHold,
                cargoPodTo.key,
                fleetTokenAccount.address,
                tokenToResult.address,
                fleetTokenAccount.mint,
                cargoType.key,
                programs,
                new BN(fleetTokenAccount.delegatedAmount.toString()),
            ),
        )
    }
    const instructions = await ixReturnsToIxs(
        withdrawInstructions,
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
