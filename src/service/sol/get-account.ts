import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { Resource } from '../wallet/index.js'

const resourceAccounts: Map<string, PublicKey> = new Map()

export const getAccount = async (
    player: PublicKey,
    resource: Resource,
): Promise<PublicKey> => {
    if (!resourceAccounts.get(resource.toString())) {
        const ret = await PublicKey.findProgramAddress(
            [
                player.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                resource.toBuffer(),
            ],
            new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        )

        resourceAccounts.set(resource.toString(), ret[0])
    }

    return resourceAccounts.get(resource.toString()) as Resource
}
