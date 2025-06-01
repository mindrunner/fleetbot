import { ixReturnsToIxs } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates.js'
import { getStarbasePlayer } from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'

export const undock = async (
    fleet: Fleet,
    coordinates: Coordinates,
    player: Player,
    game: Game,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }
    const { sage } = programs
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const ix = Fleet.loadingBayToIdle(
        sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleet.key,
        starbase.key,
        starbasePlayer.key,
        game.key,
        game.data.gameState,
        player.keyIndex,
    )

    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions()(instructions)
}
