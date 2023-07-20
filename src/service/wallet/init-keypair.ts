import { Keypair } from '@solana/web3.js'
import { mnemonicToSeedSync } from 'bip39'
import { derivePath } from 'ed25519-hd-key'

import { config } from '../../config'
import { logger } from '../../logger'

const initKeypairBySecretKey = (key: number[]): Keypair => {
    const keypair = Keypair.fromSecretKey(new Uint8Array(key))

    logger.info(`key => ${keypair.publicKey.toBase58()}`)

    return keypair
}

const initKeypairByMnemonic = (mnemonic: string, accountNumber: number): Keypair => {
    const seed = mnemonicToSeedSync(mnemonic, '')
    const path = `m/44'/501'/${accountNumber}'/0'`
    const keypair = Keypair.fromSeed(derivePath(path, seed.toString('hex')).key)

    logger.debug(`${path} => ${keypair.publicKey.toBase58()}`)

    return keypair
}

export const keyPair = config.user.keyMode === 'mnemonic' ? initKeypairByMnemonic(config.user.mnemonic, config.user.walletId) : initKeypairBySecretKey(config.user.secretKey)
