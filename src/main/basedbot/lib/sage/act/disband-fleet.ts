import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Fleet, Game, Starbase, WrappedShipEscrow } from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { closeDisbandedFleetIx } from '../ix/close-disbanded-fleet'
import { disbandFleetIx } from '../ix/disband-fleet'
import { disbandedFleetToEscrowIx } from '../ix/disbanded-fleet-to-escrow'
import { getFleetShips } from '../state/get-fleet-ships'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export const disbandFleet = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleet: Fleet,
): Promise<void> => {
    const ixs: InstructionReturn[] = []
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)

    const { disbandedFleetKey, instructions } = disbandFleetIx(
        player,
        game,
        starbase,
        starbasePlayer,
        programs,
        fleet,
    )

    ixs.push(instructions)

    const [fleetShips] = await getFleetShips(fleet)
    let i = 0

    for (const fleetShipInfo of fleetShips.fleetShips) {
        const pred = (v: WrappedShipEscrow) => v.ship.equals(fleetShipInfo.ship)
        // const shipEscrow = starbasePlayer.wrappedShipEscrows.find(pred)
        const shipEscrowIndex =
            starbasePlayer.wrappedShipEscrows.findIndex(pred)

        ixs.push(
            disbandedFleetToEscrowIx(
                player,
                game,
                starbase,
                starbasePlayer,
                programs,
                shipEscrowIndex,
                disbandedFleetKey[0],
                fleet.data.fleetShips,
                fleetShipInfo.ship,
                i,
                fleetShipInfo.amount,
            ),
        )
        console.log('Pushed disbanded fleet to escrow instruction')
        i += 1
    }

    ixs.push(
        closeDisbandedFleetIx(
            player,
            programs,
            disbandedFleetKey[0],
            fleet.data.fleetShips,
        ),
    )

    await sendAndConfirmInstructions(await ixReturnsToIxs(ixs, player.signer))
}
