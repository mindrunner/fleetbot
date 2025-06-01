import { readAllFromRPC } from '@staratlas/data-source'
import { Starbase } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'

export const starbaseByCoordinates = async (
    coordinates: Coordinates,
): Promise<Starbase | null> => {
    const [starbase] = await readAllFromRPC(
        connection,
        programs.sage,
        Starbase,
        'processed',
        [
            {
                memcmp: {
                    offset: 41,
                    bytes: coordinates.xB58,
                },
            },
            {
                memcmp: {
                    offset: 49,
                    bytes: coordinates.yB58,
                },
            },
        ],
    )

    if (!starbase) {
        return null
    }

    if (starbase.type === 'error') {
        throw new Error('Error reading starbase account')
    }

    return starbase.data
}
