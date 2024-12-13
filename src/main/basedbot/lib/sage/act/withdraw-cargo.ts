import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'
import BN from 'bn.js'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { getTokenBalance } from '../../../basedbot'
import { programs } from '../../programs'
import { withdrawCargoIx } from '../ix/withdraw-cargo'
import { getCargoType } from '../state/cargo-types'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player'
import { Player } from '../state/user-account'

export const withdrawCargo = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    mint: PublicKey,
    amount: BN,
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const destinationTokenAccount = getAssociatedTokenAddressSync(
        mint,
        player.signer.publicKey(),
    )

    const cargoPodFrom = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )
    const sourceTokenAccount = getAssociatedTokenAddressSync(
        mint,
        cargoPodFrom.key,
        true,
    )

    instructions.push(
        createAssociatedTokenAccountIdempotent(
            mint,
            destinationTokenAccount,
            true,
        ).instructions,
    )

    const cargoType = getCargoType(player.cargoTypes, game, mint)

    const amountAtOrigin = await getTokenBalance(cargoPodFrom.key, mint)

    if (amountAtOrigin.lt(new BN(amount))) {
        throw new Error('Not enough cargo available at origin')
    }

    instructions.push(
        withdrawCargoIx(
            player,
            game,
            starbase,
            starbasePlayer,
            cargoPodFrom.key,
            sourceTokenAccount,
            destinationTokenAccount,
            cargoType.key,
            mint,
            programs,
            amount,
        ),
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
