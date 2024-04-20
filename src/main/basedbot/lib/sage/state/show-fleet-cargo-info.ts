import { logger } from '../../../../../logger'
import { getName } from '../util'

import { FleetInfo } from './user-fleets'

export const showFleetCargoInfo = (fleetInfo: FleetInfo): void => {
    const { ammo, cargo, food, fuel, toolkit } = fleetInfo.cargoLevels

    logger.info(`Fleet: ${fleetInfo.fleetName} cargo levels:`)
    logger.info(`Ammo: ${ammo}`)
    logger.info(`Food: ${food}`)
    logger.info(`Fuel: ${fuel}`)
    logger.info(`Toolkit: ${toolkit}`)
    for (const [mint, amount] of cargo.entries()) {
        logger.info(`${getName(mint)}: ${amount}`)
    }
}
