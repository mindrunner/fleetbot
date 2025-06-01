import { logger } from '../../../../../logger.js'

import { FleetInfo } from './user-fleets.js'

export const showFleetCargoInfo = (fleetInfo: FleetInfo): void => {
    const { ammo, cargo, food, fuel, toolkit } = fleetInfo.cargoLevels

    logger.info(`${fleetInfo.fleetName} cargo levels:`)
    logger.info(`Ammo: ${ammo}`)
    logger.info(`Food: ${food}`)
    logger.info(`Fuel: ${fuel}`)
    logger.info(`Toolkit: ${toolkit}`)
    for (const [mint, amount] of cargo.entries()) {
        logger.info(`${mint}: ${amount}`)
    }
}
