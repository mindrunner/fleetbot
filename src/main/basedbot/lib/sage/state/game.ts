import { readAllFromRPC } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'

export const sageGame = async (): Promise<Game> => {
    const [game] = await readAllFromRPC(
        connection,
        programs.sage,
        Game,
        'processed',
        [],
    )

    if (game.type === 'error') {
        throw new Error('Error reading game account')
    }

    return game.data
}
