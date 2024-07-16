import { PublicKey } from '@solana/web3.js'
import { CargoType } from '@staratlas/cargo'
import { readAllFromRPC } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getCargoTypes = async (): Promise<Array<CargoType>> => {
    const cargoTypesAccountData = await readAllFromRPC(
        connection,
        programs.cargo,
        CargoType,
    )

    return cargoTypesAccountData
        .filter((f) => f.type === 'ok' && 'data' in f)
        .map((f) => (f as any).data)
}

export const getCargoType = (
    cargoTypes: Array<CargoType>,
    game: Game,
    mint: PublicKey,
): CargoType => {
    const cargoType = cargoTypes.find(
        (ct) =>
            game.data.cargo.statsDefinition.equals(ct.data.statsDefinition) &&
            mint.equals(ct.data.mint),
    )

    if (!cargoType) {
        throw new Error(`Cargo type not found for mint ${mint}.`)
    }

    return cargoType
}
