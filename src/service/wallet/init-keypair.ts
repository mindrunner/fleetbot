import { Keypair } from '@solana/web3.js'
import { mnemonicToSeedSync } from 'bip39'
import { derivePath } from 'ed25519-hd-key'

import { config } from '../../config'
import { logger } from '../../logger'

const initKeypair = (mnemonic: string, accountNumber: number): Keypair => {
    const seed = mnemonicToSeedSync(mnemonic, '')
    const path = `m/44'/501'/${accountNumber}'/0'`
    const keypair = Keypair.fromSeed(derivePath(path, seed.toString('hex')).key)

    logger.debug(`${path} => ${keypair.publicKey.toBase58()}`)

    return keypair
}

export const keyPair = initKeypair(config.user.mnemonic, config.user.walletId)
