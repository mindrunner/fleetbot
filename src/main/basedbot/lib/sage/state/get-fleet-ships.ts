import { readAllFromRPC } from '@staratlas/data-source'
import { Fleet, FleetShips } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getFleetShips = async (
    fleet: Fleet,
): Promise<Array<FleetShips>> => {
    const resources = await readAllFromRPC(
        connection,
        programs.sage,
        FleetShips,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1,
                    bytes: fleet.key.toBase58(),
                },
            },
        ],
    )

    return resources
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
