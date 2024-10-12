import { readAllFromRPC } from '@staratlas/data-source'
import { Game, Planet } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getPlanets = async (game: Game): Promise<Array<Planet>> => {
    const planets = await readAllFromRPC(
        connection,
        programs.sage,
        Planet,
        'processed',
        [
            {
                memcmp: {
                    offset: 8 + 1 + 64,
                    bytes: game.key.toBase58(),
                },
            },
        ],
    )

    return planets
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
