import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
    createAssociatedTokenAccountIdempotent,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import {
    Game,
    SagePlayerProfile,
    Ship,
    Starbase,
    WrappedShipEscrow,
} from '@staratlas/sage'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { addShipEscrowIx } from '../ix/add-ship-escrow'
import { getShipByMint, getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

import { FleetShips } from './create-fleet'

export const depositShip = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    ship: Ship,
    amount: BN,
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
        game.key,
    )
    const shipEscrowTokenAccountResult = createAssociatedTokenAccountIdempotent(
        mint,
        sagePlayerProfile,
        true,
    )

    instructions.push(shipEscrowTokenAccountResult.instructions)

    let uiAmount = 0
    try {
        const info = await connection.getTokenAccountBalance(sourceTokenAccount)
        if (info.value.uiAmount === null) uiAmount = 0
        else uiAmount = info.value.uiAmount
    } catch (_) {
        uiAmount = 0
    }

    const amountAtOrigin = new BN(uiAmount)

    if (amountAtOrigin.lt(new BN(amount))) {
        throw new Error(
            `Not enough ships available at origin ${ship.data.mint.toBase58()}`,
        )
    }

    const pred = (v: WrappedShipEscrow) => v.ship.equals(ship.key)
    // const shipEscrow = starbasePlayer.wrappedShipEscrows.find(pred)
    const index = starbasePlayer.wrappedShipEscrows.findIndex(pred)

    instructions.push(
        addShipEscrowIx(
            player,
            game,
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

    await sendAndConfirmInstructions()(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
export const ensureShips = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleetShips: FleetShips,
): Promise<void> => {
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    for (const fleetShip of fleetShips) {
        const desiredAmount = new BN(fleetShip.count)

        const ship = await getShipByMint(fleetShip.shipMint, game, programs)
        const pred = (v: WrappedShipEscrow) => v.ship.equals(ship.key)
        const shipEscrow = starbasePlayer.wrappedShipEscrows.find(pred)
        const needed = shipEscrow
            ? desiredAmount.sub(shipEscrow.amount)
            : desiredAmount

        if (needed.gt(new BN(0))) {
            await depositShip(player, game, starbase, ship, needed)
        }
    }
}
