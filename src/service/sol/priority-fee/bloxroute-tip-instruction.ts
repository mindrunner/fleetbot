import {
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js'

const TRADER_API_TIP_WALLET = 'HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY'
export const createBloxrouteTipInstruction = (
    senderAddress: PublicKey,
    tipAmount: number,
): TransactionInstruction => {
    const tipAddress = new PublicKey(TRADER_API_TIP_WALLET)

    return SystemProgram.transfer({
        fromPubkey: senderAddress,
        toPubkey: tipAddress,
        lamports: tipAmount,
    })
}
