import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import dayjs from '../../../../../dayjs'
import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { getFuelConsumption } from '../../util/fuel-consumption'
import { subWarpIx } from '../ix/subwarp'
import { warpIx } from '../ix/warp'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

import { undock } from './undock'

export type WarpMode = 'warp' | 'subwarp' | 'auto'

export const move = async (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    player: Player,
    game: Game,
    warpMode: WarpMode = 'auto',
): Promise<void> => {
    const { fleet } = fleetInfo

    if (fleet.state.MoveWarp || fleet.state.MoveSubwarp) {
        logger.warn('Fleet is already moving')

        return
    }

    if (fleet.state.StarbaseLoadingBay) {
        logger.info(
            `${fleetInfo.fleetName} is in the loading bay at ${fleet.state.StarbaseLoadingBay.starbase}, undocking...`,
        )

        await undock(fleet, fleetInfo.location, player, game)
    }

    if (fleet.state.MineAsteroid) {
        logger.info(`${fleetInfo.fleetName} is mining an asteroid, cannot move`)

        return
    }

    const { maxWarpDistance } = fleetInfo.movementStats

    const desiredDistance = fleetInfo.location.distanceFrom(coordinates) * 100

    const fuelConsumption = getFuelConsumption(
        fleetInfo.location,
        coordinates,
        fleetInfo,
    )

    const subWarpFuelConsumptionRatePerSecond = fuelConsumption.subwarp / 1000
    const warpFuelConsumptionRatePerSecond = fuelConsumption.warp / 1000

    logger.info(`Distance to Travel: ${desiredDistance}`)
    logger.info(
        `Subwarp Fuel Consumption per sec: ${subWarpFuelConsumptionRatePerSecond}`,
    )
    logger.info(
        `Warp Fuel Consumption per sec: ${warpFuelConsumptionRatePerSecond}`,
    )

    logger.info(`Fuel level: ${fleetInfo.cargoLevels.fuel}`)

    const canWarp = desiredDistance <= maxWarpDistance
    const warp = warpMode === 'warp' || (warpMode === 'auto' && canWarp)

    if (warp && fleetInfo.fleetState.data.warpCooldown) {
        const timeLeft = dayjs.duration(
            dayjs().diff(fleetInfo.fleetState.data.warpCooldownExpiry),
        )

        logger.warn(
            `Fleet is on warp cooldown, cannot warp. Retry in: ${timeLeft.humanize()}`,
        )

        return
    }

    const estimatedConsumption = warp
        ? fuelConsumption.warp
        : fuelConsumption.subwarp

    logger.info(`Estimated fuel consumption: ${estimatedConsumption}`)

    const hasEnoughFuel = fleetInfo.cargoLevels.fuel >= estimatedConsumption

    const hasEnoughFuelForRoundTrip =
        fleetInfo.cargoLevels.fuel >= estimatedConsumption * 2

    if (!hasEnoughFuel) {
        logger.warn('Not enough fuel to move')
        return
    }

    if (!hasEnoughFuelForRoundTrip) {
        logger.warn(
            'Not enough fuel for the round trip. Need Fuel at destination Starbase',
        )
    }

    const fuelTokenAccount = createAssociatedTokenAccountIdempotent(
        game.data.mints.fuel,
        fleet.data.fuelTank,
        true,
    )

    const ix = (warp ? warpIx : subWarpIx)(
        fleetInfo,
        coordinates,
        fuelTokenAccount.address,
        player,
        game,
        programs,
    )

    const instructions = await ixReturnsToIxs(
        [fuelTokenAccount.instructions, ix],
        player.signer,
    )

    await sendAndConfirmInstructions()(instructions)
}
