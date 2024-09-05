import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { depositCargoIx } from '../ix/import-cargo'
import { getCargoType } from '../state/cargo-types'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player'
import { Player } from '../state/user-account'

export const depositCargo = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    mint: PublicKey,
    amount: BN,
    // eslint-disable-next-line max-params
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const sourceTokenAccount = getAssociatedTokenAddressSync(
        mint,
        player.signer.publicKey(),
    )

    const cargoPodTo = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )
    const destinationTokenAccount = getAssociatedTokenAddressSync(
        mint,
        cargoPodTo.key,
        true,
    )

    instructions.push(
        createAssociatedTokenAccountIdempotent(mint, cargoPodTo.key, true)
            .instructions,
    )

    const cargoType = getCargoType(player.cargoTypes, game, mint)

    const allTokenAccounts = await getParsedTokenAccountsByOwner(
        connection,
        player.signer.publicKey(),
        TOKEN_PROGRAM_ID,
    )

    const [cargoTokenAccount] = allTokenAccounts.filter((it) =>
        it.address.equals(sourceTokenAccount),
    )

    if (!cargoTokenAccount) {
        throw new Error('Cargo token account not found')
    }
    const amountAtOrigin = new BN(cargoTokenAccount.amount.toString())

    if (!cargoTokenAccount) {
        throw new Error('Cargo not found at origin')
    }
    if (amountAtOrigin.lt(new BN(amount))) {
        throw new Error('Not enough cargo available at origin')
    }

    instructions.push(
        depositCargoIx(
            player,
            game,
            starbase,
            starbasePlayer,
            cargoPodTo.key,
            sourceTokenAccount,
            destinationTokenAccount,
            cargoType.key,
            programs,
            amount,
        ),
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
