import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Fleet, Game, Starbase } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { disbandFleetIx } from '../ix/disband'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const disbandFleet = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleet: Fleet,
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    instructions.push(
        disbandFleetIx(player, game, starbase, starbasePlayer, programs, fleet)
            .instructions,
    )

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
