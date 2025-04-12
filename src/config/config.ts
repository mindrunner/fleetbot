import { LoggerOptions } from 'typeorm'

import * as env from './env'

export interface Config {
    app: {
        version: string
        logLevel: string
        quickstart: boolean
        fleetFilter: string | undefined
        airdropWallets: Array<string>
        airdropUrl: string
        airdropToken: string
        basedCleanup: boolean
        fleetCount: number
        autoCreateProfile: boolean
    }
    bot: {
        telegramToken: string
        owner: string
    }
    user: {
        keyMode: string
        mnemonic: string
        pubKey: string
        secretKey: number[]
        walletId: number
        address1: string
        address2: string
    }
    db: {
        host: string
        readonlyHost?: string
        port: number
        readonlyPort?: number
        username: string
        password: string
        database: string
        logging?: LoggerOptions
    }
    cron: {
        refillInterval: string
        bookkeeperInterval: string
        resourceInterval: string
        airdropInterval: string
    }
    sol: {
        bloxroute: boolean
        rpcEndpoint: string
        wsEndpoint: string
        fleetAddress: string
        atlasMint: string
        marketAddress: string
        toolMint: string
        foodMint: string
        fuelMint: string
        ammoMint: string
        feeLimit: number
    }
}

export const config: Config = {
    app: {
        version: env.get('APP_VERSION'),
        logLevel: env.get('LOG_LEVEL'),
        quickstart: env.get('QUICKSTART') === 'true',
        fleetFilter: env.getOptional('FLEET_FILTER'),
        airdropWallets: env.getOptional('AIRDROP_WALLETS')?.split(',') ?? [],
        airdropUrl: env.getOptional('AIRDROP_URL') ?? 'http://localhost:5001',
        airdropToken: env.getOptional('AIRDROP_TOKEN') ?? '',
        basedCleanup: env.getOptional('BASED_CLEANUP') === 'true',
        fleetCount: Number(env.getOptional('FLEET_COUNT') ?? 10),
        autoCreateProfile: env.getOptional('AUTO_CREATE_PROFILE') === 'true',
    },
    bot: {
        telegramToken: env.get('TELEGRAM_TOKEN'),
        owner: env.get('BOT_OWNER'),
    },
    user: {
        keyMode: env.get('KEY_MODE'),
        secretKey: env
            .get('SECRET_KEY')
            .split(',')
            .map((s) => Number(s)),
        pubKey: env.get('PUBKEY'),
        mnemonic: env.get('MNEMONIC'),
        walletId: Number(env.get('WALLET_ID')),
        address1: env.get('BOT_ADDRESS_1'),
        address2: env.get('BOT_ADDRESS_2'),
    },
    db: {
        host: env.get('DATABASE_HOST'),
        port: Number(env.get('DATABASE_PORT')),
        username: env.get('DATABASE_USER'),
        password: env.get('DATABASE_PASSWORD'),
        database: env.get('DATABASE_NAME'),
        logging: env.get('DATABASE_LOGGING') as LoggerOptions,
    },
    sol: {
        bloxroute: env.get('BLOXROUTE') === 'true',
        rpcEndpoint: env.get('RPC_ENDPOINT'),
        wsEndpoint: env.get('WS_ENDPOINT'),
        fleetAddress: env.get('FLEET_ADDRESS'),
        marketAddress: env.get('MARKET_ADDRESS'),
        atlasMint: env.get('ATLAS_MINT'),
        toolMint: env.get('TOOL_MINT'),
        foodMint: env.get('FOOD_MINT'),
        fuelMint: env.get('FUEL_MINT'),
        ammoMint: env.get('AMMO_MINT'),
        feeLimit: Number(env.get('FEE_LIMIT')),
    },
    cron: {
        refillInterval: env.get('REFILL_INTERVAL'),
        bookkeeperInterval: env.get('BOOKKEEPER_INTERVAL'),
        resourceInterval: env.get('RESOURCE_INTERVAL'),
        airdropInterval: env.getOptional('AIRDROP_INTERVAL') ?? '0 0 * * *',
    },
}
