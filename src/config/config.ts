import { LoggerOptions } from 'typeorm'

import * as env from './env'

export interface Config {
    app: {
        version: string
        logLevel: string
        quickstart: boolean
    }
    bot: {
        telegramToken: string
        owner: string
    }
    user: {
        keyMode: string
        mnemonic: string
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
    }
    sol: {
        rpcEndpoint: string
        wsEndpoint: string
        fleetAddress: string
        priorityFee: number
        atlasMint: string
        marketAddress: string
        toolMint: string
        foodMint: string
        fuelMint: string
        ammoMint: string
    }
}

export const config: Config = {
    app: {
        version: env.get('APP_VERSION'),
        logLevel: env.get('LOG_LEVEL'),
        quickstart: env.get('QUICKSTART') === 'true'
    },
    bot: {
        telegramToken: env.get('TELEGRAM_TOKEN'),
        owner: env.get('BOT_OWNER')
    },
    user: {
        keyMode: env.get('KEY_MODE'),
        secretKey: env.get('SECRET_KEY').split(',').map(s => Number(s)),
        mnemonic: env.get('MNEMONIC'),
        walletId: Number(env.get('WALLET_ID')),
        address1: env.get('BOT_ADDRESS_1'),
        address2: env.get('BOT_ADDRESS_2')
    },
    db: {
        host: env.get('DATABASE_HOST'),
        port: Number(env.get('DATABASE_PORT')),
        username: env.get('DATABASE_USER'),
        password: env.get('DATABASE_PASSWORD'),
        database: env.get('DATABASE_NAME'),
        logging: env.get('DATABASE_LOGGING') as LoggerOptions
    },
    sol: {
        rpcEndpoint: env.get('RPC_ENDPOINT'),
        wsEndpoint: env.get('WS_ENDPOINT'),
        fleetAddress: env.get('FLEET_ADDRESS'),
        marketAddress: env.get('MARKET_ADDRESS'),
        priorityFee: Number(env.get('PRIORITY_FEE')),
        atlasMint: env.get('ATLAS_MINT'),
        toolMint: env.get('TOOL_MINT'),
        foodMint: env.get('FOOD_MINT'),
        fuelMint: env.get('FUEL_MINT'),
        ammoMint: env.get('AMMO_MINT')
    },
    cron: {
        refillInterval: env.get('REFILL_INTERVAL'),
        bookkeeperInterval: env.get('BOOKKEEPER_INTERVAL'),
        resourceInterval: env.get('RESOURCE_INTERVAL')
    }
}
