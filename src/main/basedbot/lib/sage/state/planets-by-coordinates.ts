import { readAllFromRPC } from '@staratlas/data-source'
import { Planet } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'

export const planetsByCoordinates = async (
    coordinates: Coordinates,
): Promise<Array<Planet>> => {
    const planets = await readAllFromRPC(
        connection,
        programs.sage,
        Planet,
        'processed',
        [
            {
                memcmp: {
                    offset: 105,
                    bytes: coordinates.xB58,
                },
            },
            {
                memcmp: {
                    offset: 113,
                    bytes: coordinates.yB58,
                },
            },
        ],
    )

    return planets
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
