import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'
import { logger } from '../../../../../logger'

import { connection } from '../../../../../service/sol/index.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'
import { loadCargoIx } from '../ix/load-cargo.js'
import { getCargoType } from '../state/cargo-types.js'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates.js'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const refuel = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
    game: Game,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }

    const cargoType = getCargoType(
        player.cargoTypes,
        game,
        game.data.mints.fuel,
    )
    const fleetFuelTokenResult = createAssociatedTokenAccountIdempotent(
        game.data.mints.fuel,
        fleetInfo.fleet.data.fuelTank,
        true,
    )

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const cargoPodFrom = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )

    const starbaseTokenAccounts = await getParsedTokenAccountsByOwner(
        connection,
        cargoPodFrom.key,
    )

    const currentFuel = fleetInfo.cargoLevels.fuel
    const maxFuel = fleetInfo.cargoStats.fuelCapacity
    const fuelNeeded = maxFuel - currentFuel

    logger.info(
        `Current Fuel: ${currentFuel}, Max Fuel: ${maxFuel}, Fuel Needed: ${fuelNeeded}`,
    )

    // TODO: Check if starbase has enough fuel balance

    const ix = loadCargoIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        cargoPodFrom.key,
        fleetInfo.fleet.data.fuelTank,
        starbaseTokenAccounts[0].address,
        fleetFuelTokenResult.address,
        game.data.mints.fuel,
        cargoType.key,
        programs,
        new BN(fuelNeeded),
    )

    const instructions = await ixReturnsToIxs(
        [fleetFuelTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
