import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import BN from 'bn.js'

import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { loadCargoIx } from '../ix/load-cargo'
import { getCargoType } from '../state/cargo-types'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const refuel = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(coordinates)

    if (!starbase) {
        throw new Error(`No starbase found at ${coordinates}`)
    }

    const cargoType = getCargoType(
        player.cargoTypes,
        player.game,
        player.game.data.mints.fuel,
    )
    const fleetFuelTokenResult = createAssociatedTokenAccountIdempotent(
        player.game.data.mints.fuel,
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

    console.log(
        `Current Fuel: ${currentFuel}, Max Fuel: ${maxFuel}, Fuel Needed: ${fuelNeeded}`,
    )

    const ix = loadCargoIx(
        fleetInfo,
        player,
        starbase,
        starbasePlayer,
        cargoPodFrom.key,
        fleetInfo.fleet.data.fuelTank,
        starbaseTokenAccounts[0].address,
        fleetFuelTokenResult.address,
        player.game.data.mints.fuel,
        cargoType.key,
        programs,
        new BN(fuelNeeded),
    )

    const instructions = await ixReturnsToIxs(
        [fleetFuelTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
