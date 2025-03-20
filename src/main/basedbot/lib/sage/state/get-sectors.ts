import { readAllFromRPC } from '@staratlas/data-source'
import { Game, Sector } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getSectors = async (game: Game): Promise<Array<Sector>> => {
    const resources = await readAllFromRPC(
        connection,
        programs.sage,
        Sector,
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

    return resources
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
