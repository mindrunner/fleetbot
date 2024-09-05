import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { loadCargoIx } from '../ix/load-cargo'
import { getCargoType } from '../state/cargo-types'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const loadCargo = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mint: PublicKey,
    hold: PublicKey,
    amount: number,
    // eslint-disable-next-line max-params
): Promise<void> => {
    const starbase = await starbaseByCoordinates(fleetInfo.location)

    if (!starbase) {
        throw new Error(`No starbase found at ${fleetInfo.location}`)
    }

    const cargoType = getCargoType(player.cargoTypes, game, mint)
    const fleetCargoTokenResult = createAssociatedTokenAccountIdempotent(
        mint,
        hold,
        true,
    )

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const cargoPodFrom = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )

    const allTokenAccounts = await getParsedTokenAccountsByOwner(
        connection,
        cargoPodFrom.key,
        TOKEN_PROGRAM_ID,
    )

    const cargoTokenAccountAddress = getAssociatedTokenAddressSync(
        mint,
        cargoPodFrom.key,
        true,
    )
    const [cargoTokenAccount] = allTokenAccounts.filter((it) =>
        it.address.equals(cargoTokenAccountAddress),
    )

    if (!cargoTokenAccount) {
        throw new Error('Cargo token account not found')
    }
    const fuelAmountAtOrigin = new BN(
        cargoTokenAccount.delegatedAmount.toString(),
    )

    if (!cargoTokenAccount) {
        throw new Error('Cargo not found at origin Starbase')
    }
    if (fuelAmountAtOrigin.lt(new BN(amount))) {
        throw new Error('Not enough cargo available at origin Starbase')
    }

    const ix = loadCargoIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        cargoPodFrom.key,
        hold,
        cargoTokenAccountAddress,
        fleetCargoTokenResult.address,
        mint,
        cargoType.key,
        programs,
        new BN(amount),
    )

    const instructions = await ixReturnsToIxs(
        [fleetCargoTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
