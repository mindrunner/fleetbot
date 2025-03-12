import { PublicKey } from '@solana/web3.js'
import { InstructionReturn, ixReturnsToIxs } from '@staratlas/data-source'
import {
    Game,
    Ship,
    Starbase,
    StarbasePlayer,
    WrappedShipEscrow,
} from '@staratlas/sage'

import { logger } from '../../../../../logger'
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

type ShipMintMap = {
    mint: PublicKey
    ship: Ship
}

export const createFleet = async (
    player: Player,
    game: Game,
    starbase: Starbase,
    fleetShips: FleetShips,
    name: string,
): Promise<void> => {
    const instructions: InstructionReturn[] = []

    const shipMints = (
        await Promise.all(
            fleetShips.map(async (fleetShip) => {
                return {
                    mint: fleetShip.shipMint,
                    ship: await getShipByMint(
                        fleetShip.shipMint,
                        game,
                        programs,
                    ),
                } as ShipMintMap
            }),
        )
    ).reduce(
        (acc, curr) => acc.set(curr.mint.toBase58(), curr.ship),
        new Map<string, Ship>(),
    )

    const [starbasePlayer, cargoStatsDefinition] = await Promise.all([
        getStarbasePlayer(player, starbase, programs),
        getCargoStatsDefinition(game.data.cargo.statsDefinition),
    ])

    const [head, ...tail] = fleetShips.sort(
        (a, b) =>
            getShipEscrowIndex(
                starbasePlayer,
                shipMints.get(a.shipMint.toBase58())!.key,
            ) -
            getShipEscrowIndex(
                starbasePlayer,
                shipMints.get(b.shipMint.toBase58())!.key,
            ),
    )

    const shipKey = shipMints.get(head.shipMint.toBase58())?.key

    if (!shipKey) throw new Error('No ship found')

    const escrowIndex = getShipEscrowIndex(starbasePlayer, shipKey)

    logger.debug(`Escrow index ${escrowIndex} for ${head.shipMint.toBase58()}`)

    const createFleetReturn = createFleetIx(
        player,
        game,
        starbase,
        starbasePlayer,
        programs,
        shipKey,
        cargoStatsDefinition.key,
        head.count,
        name,
        escrowIndex,
    )

    instructions.push(createFleetReturn.instructions)

    for (const fleetShip of tail) {
        const shipKey2 = shipMints.get(fleetShip.shipMint.toBase58())?.key

        if (!shipKey2) throw new Error('No ship found')

        const escrowIndex2 = getShipEscrowIndex(starbasePlayer, shipKey2)

        logger.info(
            `Escrow index ${escrowIndex2} for ${fleetShip.shipMint.toBase58()}`,
        )

        instructions.push(
            addShipToFleetIx(
                player,
                game,
                starbase,
                starbasePlayer,
                programs,
                createFleetReturn.fleetKey[0],
                shipKey2,
                fleetShip.count,
                escrowIndex2,
            ),
        )
    }

    await sendAndConfirmInstructions(
        await ixReturnsToIxs(instructions, player.signer),
    )
}
