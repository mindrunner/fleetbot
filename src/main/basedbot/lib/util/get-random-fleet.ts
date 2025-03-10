import { FleetShips } from '../sage/act/create-fleet'
import { ShipRole } from '../sage/ships'
import { Player } from '../sage/state/user-account'
import { Faction } from './galaxy-sectors-data'

export const getRandomFleet = (
    player: Player,
    mode: 'mine' | 'transport',
): FleetShips => {
    const { faction, shipData } = player

    const factionShips = Object.entries(shipData).filter(([_, value]) => {
        if (faction === Faction.MUD)
            return (
                value.name.startsWith('Fimbul') ||
                value.name.startsWith('Rainbow') ||
                value.name.startsWith('Armstrong') ||
                value.name.startsWith('Pearce') ||
                value.name.startsWith('Calico') ||
                value.name.startsWith('Opal')
            )
        if (faction === Faction.ONI)
            return (
                value.name.startsWith('Fimbul') ||
                value.name.startsWith('Rainbow') ||
                value.name.startsWith('Armstrong') ||
                value.name.startsWith('Busan') ||
                value.name.startsWith('Calico') ||
                value.name.startsWith('Ogrika')
            )
        if (faction === Faction.UST)
            return (
                value.name.startsWith('Fimbul') ||
                value.name.startsWith('Rainbow') ||
                value.name.startsWith('Armstrong') ||
                value.name.startsWith('VZUS') ||
                value.name.startsWith('Ogrika') ||
                value.name.startsWith('Opal')
            )
        return false
    })

    // Filter by mode (mining or transport)
    const roleShips = factionShips.filter(([_, value]) => {
        if (mode === 'mine')
            return (
                value.role === ShipRole.MINER || value.role === ShipRole.MULTI
            )
        if (mode === 'transport')
            return (
                value.role === ShipRole.TRANSPORT ||
                value.role === ShipRole.MULTI
            )
        return false
    })

    let fleetSize = 0
    const fleet: FleetShips = []

    while (fleetSize < 145) {
        let shipAdded = false

        const randomIndex = Math.floor(Math.random() * roleShips.length)
        const [_, shipData] = roleShips[randomIndex]

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
