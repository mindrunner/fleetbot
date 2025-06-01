import {
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'

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

    // TODO: Check if starbase has enough ammo balance

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

    await sendAndConfirmInstructions()(instructions)
}
