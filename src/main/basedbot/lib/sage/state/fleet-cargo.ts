import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
    createAssociatedTokenAccountIdempotent,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'
import BN from 'bn.js'
import bs58 from 'bs58'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'

import { sageGame } from './game'
import { Player } from './user-account'

type PartialTokenAccount = {
    amount: number | null
    tokenAccount: string
    mint: string
    owner: string
    delegate: string | null
    delegatedAmount: number
}

const getTokenAccountForKey = async (
    key: PublicKey,
): Promise<PartialTokenAccount[]> => {
    const tokenAccounts = await connection.getTokenAccountsByOwner(key, {
        programId: TOKEN_PROGRAM_ID,
    })

    const result: PartialTokenAccount[] = []

    for (const tokenAccount of tokenAccounts.value) {
        const accountKey = tokenAccount.pubkey.toBase58()
        const accountData = tokenAccount.account.data

        result.push({
            amount: new BN(accountData.subarray(64, 72), 'le').toNumber(),
            mint: bs58.encode(accountData.subarray(0, 32)),
            owner: bs58.encode(accountData.subarray(32, 64)),
            tokenAccount: accountKey,
            delegate: bs58.encode(accountData.subarray(76, 108)),
            delegatedAmount: new BN(
                accountData.slice(121, 129),
                'le',
            ).toNumber(),
        })
    }

    return result
}

const getBalance = async (
    mint: PublicKey,
    bank: PublicKey,
    player: Player,
): Promise<number> => {
    const tokenAccount = getAssociatedTokenAddressSync(mint, bank, true)

    try {
        const balance = await connection.getTokenAccountBalance(tokenAccount)

        return balance.value.uiAmount ?? 0
    } catch (e) {
        if ((e as Error).message.includes('could not find account')) {
            logger.debug(
                `No balance found for ${mint.toBase58()} at ${bank.toBase58()} creating new account`,
            )
            const fleetFuelTokenResult = createAssociatedTokenAccountIdempotent(
                mint,
                bank,
                true,
            )

            await sendAndConfirmInstructions()(
                await ixReturnsToIxs(
                    fleetFuelTokenResult.instructions,
                    player.signer,
                ),
            )

            return 0
        }
    }

    return 0
}

const getFleetCargoBalances = async (
    fleet: Fleet,
): Promise<Map<string, number>> => {
    const cargoHoldBalances = await getTokenAccountForKey(
        new PublicKey(fleet.data.cargoHold),
    )

    return new Map(
        cargoHoldBalances.map((tokenAccount) => [
            tokenAccount.mint,
            tokenAccount.delegatedAmount,
        ]),
    )
}

export type FleetCargo = {
    ammo: number
    cargo: Map<string, number>
    food: number
    fuel: number
    toolkit: number
}

export const getFleetCargoBalance = async (
    fleet: Fleet,
    player: Player,
): Promise<FleetCargo> => {
    const game = await sageGame()
    const [ammo, fuel, cargo] = await Promise.all([
        getBalance(game.data.mints.ammo, fleet.data.ammoBank, player),
        getBalance(game.data.mints.fuel, fleet.data.fuelTank, player),
        getFleetCargoBalances(fleet),
    ])

    return {
        ammo,
        cargo,
        food: cargo.get(game.data.mints.food.toBase58()) ?? 0,
        fuel,
        toolkit: cargo.get(game.data.mints.repairKit.toBase58()) ?? 0,
    }
}
