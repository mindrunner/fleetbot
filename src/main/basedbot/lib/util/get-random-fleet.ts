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
            'Rainbow',
            'Armstrong',
            'Pearce',
            'Calico',
            'Opal',
        ],
        [Faction.ONI]: [
            'Fimbul',
            'Rainbow',
            'Armstrong',
            'Busan',
            'Calico',
            'Ogrika',
        ],
        [Faction.UST]: [
            'Fimbul',
            'Rainbow',
            'Armstrong',
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

    let fleetSize = 0
    const fleet: FleetShips = []

    while (fleetSize < 145) {
        let shipAdded = false

        const randomIndex = Math.floor(Math.random() * roleShips.length)
        const shipData = roleShips.sort((a, b) =>
            a.mint.toBase58().localeCompare(b.mint.toBase58()),
        )[randomIndex]

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
