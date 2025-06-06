import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'
import BN from 'bn.js'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { getTokenBalance } from '../../../basedbot.js'
import { programs } from '../../programs.js'
import { depositCargoIx } from '../ix/deposit-cargo.js'
import { getCargoType } from '../state/cargo-types.js'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'

export const depositCargo = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    mint: PublicKey,
    amount: BN,
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

    const amountAtOrigin = await getTokenBalance(
        player.signer.publicKey(),
        mint,
    )

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

    await sendAndConfirmInstructions()(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
