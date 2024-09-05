import { ixReturnsToIxs } from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { exitRespawnIx } from '../ix/exit-respawn'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const exitRespawn = async (
    fleetInfo: FleetInfo,
    starbase: Starbase,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.Respawn) {
        logger.warn('Fleet is not respawning, cannot Exit Respawn')

        return
    }

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const ix = exitRespawnIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        programs,
    )
    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions(instructions)
}
