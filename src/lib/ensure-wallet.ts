import { Wallet } from '../db/entities/wallet.js'

export const ensureWallet = async (publicKey: string): Promise<Wallet> => {
    await Wallet.upsert(
        { publicKey: publicKey.toString() },
        { conflictPaths: ['publicKey'], skipUpdateIfNoValuesChanged: true },
    )

    return Wallet.findOneOrFail({ where: { publicKey: publicKey.toString() } })
}
