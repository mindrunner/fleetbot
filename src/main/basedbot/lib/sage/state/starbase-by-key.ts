import { PublicKey } from '@solana/web3.js'
import { readFromRPC } from '@staratlas/data-source'
import { Starbase } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'

export const starbaseByKey = async (key: PublicKey): Promise<Starbase> => {
    const starbase = await readFromRPC(
        connection,
        programs.sage,
        key,
        Starbase,
        'processed',
    )

    if (!starbase) {
        throw new Error('no starbase found')
    }

    if (starbase.type === 'error') {
        throw new Error('Error reading starbase account')
    }

    return starbase.data
}
