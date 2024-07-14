import { readAllFromRPC } from '@staratlas/data-source'
import { Game, Starbase } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getStarbases = async (game: Game): Promise<Array<Starbase>> => {
    const starbases = await readAllFromRPC(
        connection,
        programs.sage,
        Starbase,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1,
                    bytes: game.key.toBase58(),
                },
            },
        ],
    )

    return starbases
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
