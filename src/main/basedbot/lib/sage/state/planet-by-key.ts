import { PublicKey } from '@solana/web3.js'
import { readFromRPC } from '@staratlas/data-source'
import { Planet } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'

export const planetByKey = async (key: PublicKey): Promise<Planet> => {
    const planet = await readFromRPC(
        connection,
        programs.sage,
        key,
        Planet,
        'processed',
    )

    if (!planet) {
        throw new Error('no planet found')
    }

    if (planet.type === 'error') {
        throw new Error('Error reading planet account')
    }

    return planet.data
}
