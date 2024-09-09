import { PublicKey } from '@solana/web3.js'
import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import {
    Game,
    Starbase,
    StarbasePlayer,
    WrappedShipEscrow,
} from '@staratlas/sage'

import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { addShipToFleetIx } from '../ix/add-ship-to-fleet'
import { createFleetIx } from '../ix/create-fleet'
import { getCargoStatsDefinition } from '../state/cargo-stats-definition'
import { getShipByMint, getStarbasePlayer } from '../state/starbase-player'
import { Player } from '../state/user-account'

export type FleetShips = Array<FleetShip>
export type FleetShip = {
    shipMint: PublicKey
    count: number
}

const getShipEscrowIndex = (
    starbasePlayer: StarbasePlayer,
    shipKey: PublicKey,
) => {
    const pred = (key: PublicKey) => (v: WrappedShipEscrow) =>
        v.ship.equals(key)
    const index = starbasePlayer.wrappedShipEscrows.findIndex(pred(shipKey))

    if (index === -1) {
        throw new Error('Ship not found')
    }

    return index
}

export const createFleet = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleetShips: FleetShips,
    name: string,
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const [head, ...tail] = fleetShips

    const [starbasePlayer, headShip, [cargoStatsDefinition]] =
        await Promise.all([
            getStarbasePlayer(player, starbase, programs),
            getShipByMint(head.shipMint, game, programs),
            getCargoStatsDefinition(),
        ])

    const createFleetReturn = createFleetIx(
        player,
        game,
        starbase,
        starbasePlayer,
        programs,
        headShip.key,
        cargoStatsDefinition.key,
        head.count,
        name,
        getShipEscrowIndex(starbasePlayer, headShip.key),
    )

    instructions.push(createFleetReturn.instructions)

    for (const fleetShip of tail) {
        const ship = await getShipByMint(fleetShip.shipMint, game, programs)

        instructions.push(
            addShipToFleetIx(
                player,
                game,
                starbase,
                starbasePlayer,
                programs,
                createFleetReturn.fleetKey[0],
                ship.key,
                fleetShip.count,
                getShipEscrowIndex(starbasePlayer, ship.key),
            ),
        )
    }

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
