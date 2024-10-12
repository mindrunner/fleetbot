import { CargoStatsDefinition } from '@staratlas/cargo'
import { readAllFromRPC } from '@staratlas/data-source'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getCargoStatsDefinition = async (): Promise<
    Array<CargoStatsDefinition>
> => {
    const cargoTypesAccountData = await readAllFromRPC(
        connection,
        programs.cargo,
        CargoStatsDefinition,
    )

    return cargoTypesAccountData
        .filter((f) => f.type === 'ok' && 'data' in f)
        .map((f) => (f as any).data)
}
