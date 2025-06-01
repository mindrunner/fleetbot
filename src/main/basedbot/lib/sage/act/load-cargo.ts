import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'
import BN from 'bn.js'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { getTokenBalance } from '../../../basedbot.js'
import { programs } from '../../programs.js'
import { loadCargoIx } from '../ix/load-cargo.js'
import { getCargoType } from '../state/cargo-types.js'
import { starbaseByCoordinates } from '../state/starbase-by-coordinates.js'
import {
    getCargoPodsForStarbasePlayer,
    getStarbasePlayer,
} from '../state/starbase-player.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'
import { getName } from '../util.js'

export const getFleetCargoHold = (
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

export const loadCargo = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mint: PublicKey,
    amount: number,
    forceCargoHold: boolean = false,
): Promise<void> => {
    if (amount < 1) {
        logger.warn(`Cannot load amount less than 1 (${amount})`)
        return
    }
    const starbase = await starbaseByCoordinates(fleetInfo.location)

    const hold = forceCargoHold
        ? fleetInfo.fleet.data.cargoHold
        : getFleetCargoHold(mint, game, fleetInfo)

    if (!starbase) {
        throw new Error(`No starbase found at ${fleetInfo.location}`)
    }

    const cargoType = getCargoType(player.cargoTypes, game, mint)
    const fleetCargoTokenResult = createAssociatedTokenAccountIdempotent(
        mint,
        hold,
        true,
    )

    const starbasePlayer = await getStarbasePlayer(player, starbase, programs)
    const cargoPodFrom = await getCargoPodsForStarbasePlayer(
        starbasePlayer,
        programs,
    )

    const cargoTokenAccountAddress = getAssociatedTokenAddressSync(
        mint,
        cargoPodFrom.key,
        true,
    )

    const cargoAmountAtOrigin = await getTokenBalance(cargoPodFrom.key, mint)
    const toLoad = cargoAmountAtOrigin.lt(new BN(amount))
        ? cargoAmountAtOrigin
        : new BN(amount)

    if (toLoad.eq(new BN(0))) {
        logger.warn(`No ${mint} available at ${getName(starbase)}...`)

        return
    }
    if (cargoAmountAtOrigin.lt(new BN(amount))) {
        logger.warn(
            `Not enough cargo available at origin Starbase, loading ${cargoAmountAtOrigin} instead of ${amount}`,
        )
    }

    const ix = loadCargoIx(
        fleetInfo,
        player,
        game,
        starbase,
        starbasePlayer,
        cargoPodFrom.key,
        hold,
        cargoTokenAccountAddress,
        fleetCargoTokenResult.address,
        mint,
        cargoType.key,
        programs,
        toLoad,
    )

    const instructions = await ixReturnsToIxs(
        [fleetCargoTokenResult.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
