import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
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

export const rearm = async (
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
        game.data.mints.ammo,
    )
    const fleetFuelTokenResult = createAssociatedTokenAccountIdempotent(
        game.data.mints.ammo,
        fleetInfo.fleet.data.ammoBank,
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

    const currentAmmo = fleetInfo.cargoLevels.ammo
    const maxAmmo = fleetInfo.cargoStats.ammoCapacity
    const ammoNeeded = maxAmmo - currentAmmo

    console.log(
        `Current Ammo: ${currentAmmo}, Max Ammo: ${maxAmmo}, Ammo Needed: ${ammoNeeded}`,
    )

    const ix = loadCargoIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        cargoPodFrom.key,
        fleetInfo.fleet.data.ammoBank,
        starbaseTokenAccounts[0].address,
        fleetFuelTokenResult.address,
        game.data.mints.ammo,
        cargoType.key,
        programs,
        new BN(ammoNeeded),
    )

    const instructions = await ixReturnsToIxs(
        [fleetFuelTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
