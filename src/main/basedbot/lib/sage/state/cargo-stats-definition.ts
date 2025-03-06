import { PublicKey } from '@solana/web3.js'
import { CargoStatsDefinition } from '@staratlas/cargo'
import { readAllFromRPC } from '@staratlas/data-source'
import { logger } from '../../../../../logger'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'

export const getCargoStatsDefinition = async (
    statsDefinitionKey: PublicKey,
): Promise<CargoStatsDefinition> => {
    const cargoTypesAccountData = await readAllFromRPC(
        connection,
        programs.cargo,
        CargoStatsDefinition,
    )

    for (const f of cargoTypesAccountData) {
        logger.info(JSON.stringify(f))
    }

    return cargoTypesAccountData
        .filter((f) => f.type === 'ok' && 'data' in f)
        .map((f) => (f as any).data)
        .find((f) => f.key.toString() === statsDefinitionKey.toString())
}
