import { ixReturnsToIxs } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'
import { dockIx } from '../ix/dock.js'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates.js'
import { getStarbasePlayer } from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const dock = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
    game: Game,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const ix = dockIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        programs,
    )

    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions()(instructions)
}
