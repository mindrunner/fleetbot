import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
    createAssociatedTokenAccountIdempotent,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import {
    SagePlayerProfile,
    Ship,
    Starbase,
    WrappedShipEscrow,
} from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { addShipIx } from '../ix/add-ship'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const depositShip = async (
    player: Player,
    starbase: Starbase,
    ship: Ship,
    amount: BN,
    // eslint-disable-next-line max-params,require-await
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const { mint } = ship.data
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const sourceTokenAccount = getAssociatedTokenAddressSync(
        mint,
        player.signer.publicKey(),
    )

    const [sagePlayerProfile] = SagePlayerProfile.findAddress(
        programs.sage,
        player.profile.key,
        player.game.key,
    )
    const shipEscrowTokenAccountResult = createAssociatedTokenAccountIdempotent(
        mint,
        sagePlayerProfile,
        true,
    )

    instructions.push(shipEscrowTokenAccountResult.instructions)

    const info = await connection.getTokenAccountBalance(sourceTokenAccount)

    if (info.value.uiAmount === null) throw new Error('No balance found')

    const amountAtOrigin = new BN(info.value.uiAmount)

    if (amountAtOrigin.lt(new BN(amount))) {
        throw new Error('Not enough ships available at origin')
    }

    const pred = (v: WrappedShipEscrow) => v.ship.equals(ship.key)
    // const shipEscrow = starbasePlayer.wrappedShipEscrows.find(pred)
    const index = starbasePlayer.wrappedShipEscrows.findIndex(pred)

    instructions.push(
        addShipIx(
            player,
            starbase,
            starbasePlayer,
            sagePlayerProfile,
            programs,
            sourceTokenAccount,
            ship.key,
            shipEscrowTokenAccountResult.address,
            amount,
            index === -1 ? null : index,
        ),
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
export const ensureShips = async (
    player: Player,
    starbase: Starbase,
    ship: Ship,
    desiredAmount: BN,
): Promise<BN> => {
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const pred = (v: WrappedShipEscrow) => v.ship.equals(ship.key)
    const shipEscrow = starbasePlayer.wrappedShipEscrows.find(pred)
    const needed = shipEscrow
        ? desiredAmount.sub(shipEscrow.amount)
        : desiredAmount

    if (needed.gt(new BN(0))) {
        await depositShip(player, starbase, ship, needed)
    }

    return needed
}
