import { ixReturnsToIxs } from '@staratlas/data-source'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { exitRespawnIx } from '../ix/exit-respawn'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const exitRespawn = async (fleetInfo: FleetInfo, location: Coordinates, player: Player): Promise<void> => {
    const { fleet } = fleetInfo

    if (!fleet.state.Respawn) {
        logger.warn('Fleet is not respawning, cannot Exit Respawn')

        return
    }

    const starbase = await starbaseByCoordinates(location)

    if(!starbase) {
        throw new Error(`No starbase found at ${location}`)
    }

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const ix = exitRespawnIx(fleetInfo, player, starbase, starbasePlayer, programs)
    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions(instructions)
}
