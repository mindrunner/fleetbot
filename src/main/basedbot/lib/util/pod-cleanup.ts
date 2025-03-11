import { Account, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { CargoIDLProgram, CargoType } from '@staratlas/cargo'
import {
    AsyncSigner,
    createAssociatedTokenAccountIdempotent,
    getParsedTokenAccountsByOwner,
    InstructionReturn,
} from '@staratlas/data-source'
import {
    getCargoPodsByAuthority,
    SageIDLProgram,
    StarbasePlayer,
} from '@staratlas/sage'
import BN from 'bn.js'

interface PodCleanup {
    mainPod: PublicKey
    podsAndTokensToClean: [PublicKey, Account[]][]
    cargoSeqId: number
}

export const getCleanPodsByStarbasePlayerAccounts = async (
    connection: Connection,
    cargoProgram: CargoIDLProgram,
    starbasePlayer: PublicKey,
): Promise<PodCleanup | undefined> => {
    const cargoPods = await getCargoPodsByAuthority(
        connection,
        cargoProgram,
        starbasePlayer,
    )
    if (cargoPods.length > 1) {
        let podsToClean = cargoPods.map((cargoPod) => {
            if (cargoPod.type === 'error')
                throw new Error('Error reading CargoPod account')
            return cargoPod.data
        })
        const mainPod = podsToClean.reduce((prev, current) => {
            return prev.data.openTokenAccounts > current.data.openTokenAccounts
                ? prev
                : current
        })
        podsToClean = podsToClean.filter((it) => !it.key.equals(mainPod.key))
        const podsAndTokensToClean: Array<[PublicKey, Account[]]> =
            await Promise.all(
                podsToClean.map(async (thisPod) => {
                    const podTokenAccounts =
                        await getParsedTokenAccountsByOwner(
                            connection,
                            thisPod.key,
                        )
                    return [thisPod.key, podTokenAccounts]
                }),
            )

        return {
            mainPod: mainPod.key,
            podsAndTokensToClean,
            cargoSeqId: mainPod.data.seqId,
        }
    }
    return undefined
}

export const getPodCleanupInstructions = (
    podCleanup: PodCleanup,
    sageProgram: SageIDLProgram,
    cargoProgram: CargoIDLProgram,
    starbasePlayer: PublicKey,
    starbase: PublicKey,
    playerProfile: PublicKey,
    profileFaction: PublicKey,
    cargoStatsDefinition: PublicKey,
    gameId: PublicKey,
    gameState: PublicKey,
    key: AsyncSigner,
    keyIndex: number,
) => {
    const cleanInstructions: InstructionReturn[] = []
    const newTokenAccounts: string[] = []
    if (podCleanup.podsAndTokensToClean.length > 1) {
        for (
            let index2 = 0;
            index2 < podCleanup.podsAndTokensToClean.length;
            index2++
        ) {
            const element = podCleanup.podsAndTokensToClean[index2]
            const thisPodKey = element[0]
            const podTokenAccounts = element[1]
            if (podTokenAccounts.length > 0) {
                for (
                    let index3 = 0;
                    index3 < podTokenAccounts.length;
                    index3++
                ) {
                    const tokenData = podTokenAccounts[index3]
                    const cargoType = CargoType.findAddress(
                        cargoProgram,
                        cargoStatsDefinition,
                        tokenData.mint,
                        podCleanup.cargoSeqId,
                    )[0]
                    if (Number(tokenData.delegatedAmount) > 0) {
                        const tokenTo = createAssociatedTokenAccountIdempotent(
                            tokenData.mint,
                            podCleanup.mainPod,
                            true,
                            TOKEN_PROGRAM_ID,
                        )
                        const tokenToBase58 = tokenTo.address.toBase58()
                        if (!newTokenAccounts.includes(tokenToBase58)) {
                            newTokenAccounts.push(tokenToBase58)
                            cleanInstructions.push(tokenTo.instructions)
                        }
                        const transferIx =
                            StarbasePlayer.transferCargoAtStarbase(
                                sageProgram,
                                cargoProgram,
                                starbasePlayer,
                                key,
                                'funder',
                                playerProfile,
                                profileFaction,
                                starbase,
                                thisPodKey,
                                podCleanup.mainPod,
                                cargoType,
                                cargoStatsDefinition,
                                tokenData.address,
                                tokenTo.address,
                                tokenData.mint,
                                gameId,
                                gameState,
                                {
                                    amount: new BN(
                                        tokenData.delegatedAmount.toString(),
                                    ),
                                    keyIndex,
                                },
                            )
                        cleanInstructions.push(transferIx)
                    } else {
                        const closeIx =
                            StarbasePlayer.closeStarbaseCargoTokenAccount(
                                sageProgram,
                                cargoProgram,
                                starbasePlayer,
                                key,
                                'funder',
                                playerProfile,
                                profileFaction,
                                starbase,
                                thisPodKey,
                                cargoType,
                                cargoStatsDefinition,
                                tokenData.address,
                                tokenData.mint,
                                gameId,
                                gameState,
                                {
                                    keyIndex,
                                },
                            )
                        cleanInstructions.push(closeIx)
                    }
                }
            }
            cleanInstructions.push(
                StarbasePlayer.removeCargoPod(
                    sageProgram,
                    cargoProgram,
                    starbasePlayer,
                    key,
                    playerProfile,
                    profileFaction,
                    'funder',
                    starbase,
                    thisPodKey,
                    gameId,
                    gameState,
                    {
                        keyIndex,
                    },
                ),
            )
        }
    }
    return cleanInstructions
}
