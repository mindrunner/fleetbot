import { ixReturnsToIxs } from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { Coordinates } from '../../util/coordinates'
import { sageGame } from '../state/game'
import { programs } from '../../programs'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const undock = async (fleet: Fleet, coordinates: Coordinates, player: Player): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if(!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }
    const { sage } = programs
    const game = await sageGame()
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
        player.keyIndex
    )

    const instructions = await ixReturnsToIxs(ix, player.signer)

    await sendAndConfirmInstructions(instructions)
}
