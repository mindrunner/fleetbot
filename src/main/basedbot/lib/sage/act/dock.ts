import { ixReturnsToIxs } from '@staratlas/data-source'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { dockIx } from '../ix/dock'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const dock = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const ix = dockIx(fleetInfo, player, starbase, starbasePlayer, programs)

    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions(instructions)
}
