import { Wallet } from '../db/entities'

export const ensureWallet = async (publicKey: string): Promise<Wallet> => {
    let wallet = await Wallet.findOneBy({ publicKey: publicKey.toString() })

    if (!wallet) {
        wallet = Wallet.create({ publicKey: publicKey.toString() })

        return wallet.save()
    }

    return wallet
}
