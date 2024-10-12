import { Keypair, PublicKey } from '@solana/web3.js'
import { mnemonicToSeedSync } from 'bip39'
import { derivePath } from 'ed25519-hd-key'

import { config } from '../../config'
import { logger } from '../../logger'

const initKeypairBySecretKey = (key: number[], pubKey: PublicKey): Keypair => {
    const keypair = Keypair.fromSecretKey(new Uint8Array(key))

    if (keypair.publicKey.equals(pubKey)) {
        logger.info(`Found keypair for ${pubKey.toBase58()}`)

        return keypair
    }

    throw new Error('PubKey does not match Private key')
}

const initKeypairByMnemonic = (
    mnemonic: string,
    pubKey: PublicKey,
): Keypair => {
    const seed = mnemonicToSeedSync(mnemonic, '')

    for (let i = 0; i < 1000; ++i) {
        const path = `m/44'/501'/${i}'/0'`
        const keypair = Keypair.fromSeed(
            derivePath(path, seed.toString('hex')).key,
        )

        logger.debug(`${path} => ${keypair.publicKey.toBase58()}`)

        if (keypair.publicKey.equals(pubKey)) {
            logger.info(`Found keypair for ${pubKey.toBase58()} at ${path}`)

            return keypair
        }
    }

    throw new Error('PubKey not found in derivation Path')
}

export const keyPair =
    config.user.keyMode === 'mnemonic'
        ? initKeypairByMnemonic(
              config.user.mnemonic,
              new PublicKey(config.user.pubKey),
          )
        : initKeypairBySecretKey(
              config.user.secretKey,
              new PublicKey(config.user.pubKey),
          )
