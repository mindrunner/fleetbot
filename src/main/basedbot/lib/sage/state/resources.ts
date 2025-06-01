import { readAllFromRPC } from '@staratlas/data-source'
import { Game, Resource } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'

export const getResources = async (game: Game): Promise<Array<Resource>> => {
    const resources = await readAllFromRPC(
        connection,
        programs.sage,
        Resource,
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
