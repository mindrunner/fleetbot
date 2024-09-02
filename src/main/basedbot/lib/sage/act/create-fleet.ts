import { PublicKey } from '@solana/web3.js'
import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Starbase } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { createFleetIx } from '../ix/create-fleet'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const createFleet = async (
    player: Player,
    starbase: Starbase,
    _mint: PublicKey,
    name: string,
    amount: number,
    // eslint-disable-next-line max-params
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    // TODO: Ask Sammy about this
    const [shipEscrow] = starbasePlayer.wrappedShipEscrows

    const [cargoStatsDefinition] = await getCargoStatsDefinition()

    instructions.push(
        createFleetIx(
            player,
            starbase,
            starbasePlayer,
            programs,
            shipEscrow.ship,
            0,
            cargoStatsDefinition.key,
            amount,
            name,
        ).instructions,
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
