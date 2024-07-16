import { readAllFromRPC } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

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
