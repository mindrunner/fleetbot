import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { getTokenBalance } from '../../../basedbot'
import { programs } from '../../programs'
import { unloadCargoIx } from '../ix/unload-cargo'
import { getCargoType } from '../state/cargo-types'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { getFleetCargoHold } from './load-cargo'

export const getHold = (
    mint: PublicKey,
    game: Game,
    fleetInfo: FleetInfo,
): PublicKey => {
    switch (mint.toBase58()) {
        case game.data.mints.fuel.toBase58():
            return fleetInfo.fleet.data.fuelTank
        case game.data.mints.ammo.toBase58():
            return fleetInfo.fleet.data.ammoBank
        default:
            return fleetInfo.fleet.data.cargoHold
    }
}

export const unloadCargo = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mint: PublicKey,
    amount: BN,
    forceCargoHold: boolean = false,
): Promise<void> => {
    const starbase = await starbaseByCoordinates(fleetInfo.location)

    if (!starbase) {
        throw new Error(`No starbase found at ${fleetInfo.location}`)
    }

    const cargoType = getCargoType(player.cargoTypes, game, mint)

    const fleetCargoPod = forceCargoHold
        ? fleetInfo.fleet.data.cargoHold
        : getFleetCargoHold(mint, game, fleetInfo)

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const cargoPodTo = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )

    const cargoPodTokenAccountAddress = getAssociatedTokenAddressSync(
        mint,
        cargoPodTo.key,
        true,
    )
    const cargoFleetTokenAccountAddress = getAssociatedTokenAddressSync(
        mint,
        fleetCargoPod,
        true,
    )
    const cargoPodTokenResult = createAssociatedTokenAccountIdempotent(
        mint,
        cargoPodTo.key,
        true,
    )

    const fuelAmountAtOrigin = await getTokenBalance(fleetCargoPod, mint)

    if (fuelAmountAtOrigin.lt(amount)) {
        logger.warn(
            `Requested ${amount.toNumber()} cargo to unload. can only unload ${fuelAmountAtOrigin.toNumber()}`,
        )
    }
    const toUnload = fuelAmountAtOrigin.lt(amount) ? fuelAmountAtOrigin : amount

    const ix = unloadCargoIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        fleetCargoPod,
        cargoPodTo.key,
        cargoFleetTokenAccountAddress,
        cargoPodTokenAccountAddress,
        mint,
        cargoType.key,
        programs,
        toUnload,
    )

    const instructions = await ixReturnsToIxs(
        [cargoPodTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions(instructions)
}
