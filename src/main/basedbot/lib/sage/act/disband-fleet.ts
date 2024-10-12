import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import { Game, Starbase, WrappedShipEscrow } from '@staratlas/sage'

import dayjs from '../../../../../dayjs'
import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { closeDisbandedFleetIx } from '../ix/close-disbanded-fleet'
import { disbandFleetIx } from '../ix/disband-fleet'
import { disbandedFleetToEscrowIx } from '../ix/disbanded-fleet-to-escrow'
import { getFleetShips } from '../state/get-fleet-ships'
import { getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { getName } from '../util'

export const disbandFleet = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleetInfo: FleetInfo,
): Promise<void> => {
    const ixs: InstructionReturn[] = []
    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const { fleet } = fleetInfo

    if (fleetInfo.fleetState.data.warpCooldown) {
        const timeLeft = dayjs.duration(
            dayjs().diff(fleetInfo.fleetState.data.warpCooldownExpiry),
        )

        logger.warn(
            `Fleet is on warp cooldown, cannot disband. Retry in: ${timeLeft.humanize()}`,
        )

        return
    }

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
                shipEscrowIndex === -1 ? null : shipEscrowIndex,
                disbandedFleetKey[0],
                fleet.data.fleetShips,
                fleetShipInfo.ship,
                fleetShipInfo.amount,
            ),
        )
    }

    ixs.push(
        closeDisbandedFleetIx(
            player,
            programs,
            disbandedFleetKey[0],
            fleet.data.fleetShips,
        ),
    )
    console.log(
        `Added ${ixs.length} ixs for disbanding fleet ${getName(fleet)}`,
    )

    await sendAndConfirmInstructions(await ixReturnsToIxs(ixs, player.signer))
}
