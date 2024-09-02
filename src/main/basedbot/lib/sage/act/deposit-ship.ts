import { PublicKey } from '@solana/web3.js'
import { Starbase } from '@staratlas/sage'
import BN from 'bn.js'

import { Player } from '../state/user-account'

export const depositShip = async (
    _player: Player,
    _starbase: Starbase,
    _mint: PublicKey,
    _amount: BN,
    // eslint-disable-next-line max-params,require-await
): Promise<void> => {
    throw new Error('Not implemented')
    // const instructions: InstructionReturn[] = []
    //
    // const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    //
    // const sourceTokenAccount = getAssociatedTokenAddressSync(
    //     mint,
    //     player.signer.publicKey(),
    // )
    //
    //
    // const destinationTokenAccount = getAssociatedTokenAddressSync(
    //     mint,
    //     cargoPodTo.key,
    //     true,
    // )
    //
    // instructions.push(
    //     createAssociatedTokenAccountIdempotent(mint, cargoPodTo.key, true)
    //         .instructions,
    // )
    //
    // const allTokenAccounts = await getParsedTokenAccountsByOwner(
    //     connection,
    //     player.signer.publicKey(),
    //     TOKEN_PROGRAM_ID,
    // )
    //
    // const [cargoTokenAccount] = allTokenAccounts.filter((it) =>
    //     it.address.equals(sourceTokenAccount),
    // )
    //
    // if (!cargoTokenAccount) {
    //     throw new Error('Cargo token account not found')
    // }
    // const amountAtOrigin = new BN(cargoTokenAccount.amount.toString())
    //
    // if (!cargoTokenAccount) {
    //     throw new Error('Cargo not found at origin')
    // }
    // if (amountAtOrigin.lt(new BN(amount))) {
    //     throw new Error('Not enough cargo available at origin')
    // }
    //
    // instructions.push(
    //     addShipIx(
    //         player,
    //         starbase,
    //         starbasePlayer,
    //         programs,
    //         sourceTokenAccount,
    //         ship,
    //         destinationTokenAccount,
    //         amount,
    //     ),
    // )
    //
    // await sendAndConfirmInstructions(
    //     await ixReturnsToIxs(instructions, player.signer),
    // )
}
