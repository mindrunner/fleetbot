import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Ship, Starbase, WrappedShipEscrow } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { createFleetIx } from '../ix/create-fleet'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const createFleet = async (
    player: Player,
    starbase: Starbase,
    ship: Ship,
    name: string,
    amount: number,
    // eslint-disable-next-line max-params
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const [cargoStatsDefinition] = await getCargoStatsDefinition()
    const pred = (v: WrappedShipEscrow) => v.ship.equals(ship.key)
    const index = starbasePlayer.wrappedShipEscrows.findIndex(pred)

    if (index === -1) {
        throw new Error('Ship not found')
    }

    instructions.push(
        createFleetIx(
            player,
            starbase,
            starbasePlayer,
            programs,
            ship.key,
            cargoStatsDefinition.key,
            amount,
            name,
            index,
        ).instructions,
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
