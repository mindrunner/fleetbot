import { mine } from '../fsm/configs/mine'
import { createMiningStrategy } from '../fsm/mine'
import { Strategy } from '../fsm/strategy'
import { Player } from '../lib/sage/state/user-account'
import { WorldMap } from '../lib/sage/state/world-map'
import { galaxySectorsData } from '../lib/util/galaxy-sectors-data'

export const atlasnetMudStrategy =
    (count: number) =>
    (map: WorldMap, player: Player): Map<string, Strategy> => {
        const ans: Map<string, Strategy> = new Map<string, Strategy>()
        const sectors = galaxySectorsData()
            .filter((sector) => sector.closestFaction === player.faction)
            .sort((a, b) => a.name.localeCompare(b.name))

        for (let i = 0; i < count; i++) {
            ans.set(
                `basedbot-mud-${i}`,
                createMiningStrategy(
                    mine(
                        map,
                        player.homeCoordinates,
                        sectors[i % sectors.length].coordinates,
                    ),
                    player,
                ),
            )
        }

        return ans
    }