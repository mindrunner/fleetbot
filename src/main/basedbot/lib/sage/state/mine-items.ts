import { readAllFromRPC } from '@staratlas/data-source'
import { Game, MineItem } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getMineItems = async (game: Game): Promise<Array<MineItem>> => {
    const mineItems = await readAllFromRPC(
        connection,
        programs.sage,
        MineItem,
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

    return mineItems
        .filter((p) => p.type === 'ok' && 'data' in p)
        .map((p) => (p as any).data)
}
