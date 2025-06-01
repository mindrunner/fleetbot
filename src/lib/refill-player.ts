import { PublicKey } from '@solana/web3.js'
import { getAllFleetsForUserPublicKey } from '@staratlas/factory'
import Big from 'big.js'

import { Sentry } from '../sentry.js'

import dayjs from '../dayjs.js'
import { Refill } from '../db/entities/refill.js'
import { Wallet } from '../db/entities/wallet.js'
import { logger } from '../logger.js'
import { refillFleet } from '../service/fleet/index.js'
import { AD, connection, fleetProgram } from '../service/sol/index.js'

import { FleetRefill } from './const/index.js'
import { fleetDepletionInfo } from './fleet-depletion-info.js'
import { RefillStrategy } from './refill-strategy/index.js'
import { getShipName } from './stock-resources.js'

export const refillPlayer = async (
    player: PublicKey,
    strategy: RefillStrategy,
): Promise<Refill[]> => {
    const wallet = await Wallet.findOneByOrFail({
        publicKey: player.toString(),
    })
    const shipStakingInfos = await getAllFleetsForUserPublicKey(
        connection,
        player,
        fleetProgram,
    )

    if (shipStakingInfos.length === 0) {
        logger.warn(`${player.toString()} has no staked ships`)

        return []
    }

    await Promise.all(
        shipStakingInfos.map(async (shipStakingInfo) =>
            logger.info(
                `${player.toString()} ${await getShipName(shipStakingInfo)} depleting in ${(await fleetDepletionInfo(shipStakingInfo)).human}`,
            ),
        ),
    )

    const refills: FleetRefill[] = await strategy(shipStakingInfos)

    const totalCost = refills.reduce((acc, curr) => acc.add(curr.price), Big(0))
    const playerBalance = await wallet.getBalance()

    if (playerBalance.lt(totalCost)) {
        logger.warn(
            `${player.toString()} credits insufficient! Has ${playerBalance.toFixed(AD)}, need ${totalCost.toFixed(AD)}`,
        )
        await Wallet.update(
            { publicKey: wallet.publicKey },
            { nextRefill: dayjs().add(1, 'day').toDate() },
        )

        return []
    }

    const fleetRefills = await Promise.all(
        refills
            .filter(
                (refill) =>
                    refill.amount.tool.gt(0) ||
                    refill.amount.fuel.gt(0) ||
                    refill.amount.ammo.gt(0) ||
                    refill.amount.food.gt(0),
            )
            .map(async (refill) => {
                const shipName = await getShipName(refill.shipStakingInfo)

                logger.warn(
                    `${player.toString()}: Refilling ${JSON.stringify(refill.amount)} for ${shipName} costs ${refill.price.toFixed(AD)} ATLAS`,
                )

                try {
                    const tx = await refillFleet(
                        player,
                        refill.shipStakingInfo,
                        refill.amount,
                    )

                    return Promise.all(
                        tx.map((signature) => {
                            return Refill.create({
                                signature,
                                walletPublicKey: wallet.publicKey,
                                fleet: shipName,
                                preBalance: playerBalance.toNumber(),
                                postBalance: playerBalance
                                    .sub(refill.price)
                                    .toNumber(),
                                tip: wallet.tip,
                                price: refill.price.toNumber(),
                                food: refill.amount.food.toNumber(),
                                tool: refill.amount.tool.toNumber(),
                                fuel: refill.amount.fuel.toNumber(),
                                ammo: refill.amount.ammo.toNumber(),
                            }).save()
                        }),
                    )
                } catch (e) {
                    Sentry.captureException(e)
                    logger.error(
                        `Error refilling fleet: ${(e as Error).message}`,
                    )

                    return null
                }
            }),
    )

    const depletionInfos = await Promise.all(
        shipStakingInfos.map(async (shipStakingInfo) => {
            const depletionInfo = await fleetDepletionInfo(shipStakingInfo)

            logger.info(
                `${player.toString()} ${await getShipName(shipStakingInfo)} depleting in ${depletionInfo.human}`,
            )

            return depletionInfo
        }),
    )

    const secondsLeft = depletionInfos.reduce(
        (acc, cur) => Math.min(cur.seconds, acc),
        Number.MAX_SAFE_INTEGER,
    )

    const nextRefill = dayjs()
        .add(
            Big(secondsLeft).minus(Big(secondsLeft).div(4)).toNumber(),
            'second',
        )
        .toDate()

    await Wallet.update({ publicKey: wallet.publicKey }, { nextRefill })

    return fleetRefills.filter((f): f is Refill[] => f !== null).flat()
}
