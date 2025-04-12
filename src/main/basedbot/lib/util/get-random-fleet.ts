import { logger } from '../../../../logger'
import { FleetShips } from '../sage/act/create-fleet'
import { ShipMake } from '../sage/ships'
import { Player } from '../sage/state/user-account'
import { Faction } from './galaxy-sectors-data'

export const getRandomFleet = (
    player: Player,
    mode: 'mine' | 'transport',
): FleetShips => {
    const { faction, shipData } = player

    const factionMakes: Record<Faction, ShipMake[]> = {
        [Faction.MUD]: [
            'Fimbul',
            'Fimbul BYOS',
            'Fimbul ECOS',
            'Rainbow',
            'Armstrong Industries',
            'Pearce',
            'Calico',
            'Opal',
        ],
        [Faction.ONI]: [
            'Fimbul',
            'Fimbul BYOS',
            'Fimbul ECOS',
            'Rainbow',
            'Armstrong Industries',
            'Busan',
            'Calico',
            'Ogrika',
        ],
        [Faction.UST]: [
            'Fimbul',
            'Fimbul BYOS',
            'Fimbul ECOS',
            'Rainbow',
            'Armstrong Industries',
            'VZUS',
            'Ogrika',
            'Opal',
        ],
    }

    const factionShips = shipData.filter((ship) =>
        factionMakes[faction]?.includes(ship.make),
    )

    // Filter by mode (mining or transport)
    const roleShips = factionShips.filter((value) => {
        if (mode === 'mine')
            return value.role === 'miner' || value.role === 'multi-role'
        if (mode === 'transport')
            return (
                value.role === 'freighter' ||
                value.role === 'transport' ||
                value.role === 'multi-role'
            )
        return false
    })
    logger.info(`Selecting ${mode} fleet out of ${roleShips.length} options`)

    let fleetSize = 0
    const fleet: FleetShips = []

    while (fleetSize < 145 && fleet.length <= 5) {
        let shipAdded = false

        const randomIndex = Math.floor(Math.random() * roleShips.length)
        const shipData = roleShips[randomIndex]

        if (fleetSize + shipData.size <= 145) {
            fleet.push({
                shipMint: shipData.mint,
                count: 1,
            })

            fleetSize += shipData.size
            shipAdded = true
        }

        if (!shipAdded) break
    }

    return fleet
}
