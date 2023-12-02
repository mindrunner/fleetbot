// eslint-disable-next-line import/named
import { AnchorProvider, Idl, Program } from '@project-serum/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { getScoreIDL, getScoreVarsShipInfo, getShipStakingAccount, ShipStakingInfo } from '@staratlas/factory'
import Big from 'big.js'
import superagent from 'superagent'

import dayjs from '../dayjs'
import { ShipInfo, Wallet } from '../db/entities'
import { logger } from '../logger'
import { getFleetRemainingResources, getTimePass } from '../service/fleet'
import { Amounts } from '../service/fleet/const'
import { buyResources, getResourceBalances, getResourcePrices, initOrderBook } from '../service/gm'
import { AD, connection, fleetProgram } from '../service/sol'
import { keyPair } from '../service/wallet'

/**
 * Returns a list of player deployed fleets to the SCORE program
 *
 * @param conn - web3.Connection object
 * @param playerPublicKey - Player's public key
 * @param programId - Deployed program ID for the SCORE program
 * @returns - [Ship Staking Account Infos]
 */
const getAllFleetsForUserPublicKey = async (
    conn: Connection,
    playerPublicKey: PublicKey,
    programId: PublicKey
): Promise<ShipStakingInfo[]> => {
    const idl = getScoreIDL(programId)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const provider = new AnchorProvider(conn, null, null)
    const program = new Program(<Idl>idl, programId, provider)

    const shipsRegistered = await program.account.scoreVarsShip.all()

    const playerShipStakingAccounts = []

    for (const ship of shipsRegistered) {
        // eslint-disable-next-line no-await-in-loop
        const [playerShipStakingAccount] = await getShipStakingAccount(
            programId,
            ship.account.shipMint as PublicKey,
            playerPublicKey
        )

        playerShipStakingAccounts.push(playerShipStakingAccount)
    }

    const playerFleets: ShipStakingInfo[] = []

    for(const acc of playerShipStakingAccounts) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const fleet = await program.account.shipStaking.fetchNullable(acc)

            if(fleet) {
                playerFleets.push(<ShipStakingInfo>fleet)
            }
        }
        catch (e) {
            logger.error(e)
        }
    }
    logger.info(`Found ${playerFleets.length} fleets for ${playerPublicKey.toString()}`)

    return playerFleets
}

export const getShipName = async (shipStakingInfo: ShipStakingInfo): Promise<string> => {
    const mint = shipStakingInfo.shipMint.toString()
    let shipInfo = await ShipInfo.findOneBy({ mint })

    if (!shipInfo) {
        try {
            const shipNftInfo = await superagent.get(`https://galaxy.staratlas.com/nfts/${mint}`)
            const urlSplit = shipNftInfo.body.image.slice(0, -4).split('/')
            const imageName = urlSplit[urlSplit.length - 1]

            shipInfo = await ShipInfo.create({
                mint,
                name: shipNftInfo.body.name,
                imageName
            }).save()
        }
        catch {
            return 'n/a'
        }
    }

    return shipInfo.name
}

export const getPendingRewards = async (player: PublicKey): Promise<Big> => {
    const fleets = await getAllFleetsForUserPublicKey(connection, player, fleetProgram)

    const fleetInfos = await Promise.all(fleets.map(async (fleet) => {
        const shipInfo = await getScoreVarsShipInfo(
            connection,
            fleetProgram,
            fleet.shipMint
        )

        return {
            info: shipInfo,
            fleet
        }
    }))

    return fleetInfos.reduce((sum, fleetInfo) => {
        const { fleet } = fleetInfo
        const { info } = fleetInfo
        const timePass = getTimePass(fleet)
        const pendingReward = Number(fleet.shipQuantityInEscrow) *
            (Number(fleet.totalTimeStaked) - Number(fleet.stakedTimePaid) + timePass) *
            Number(info.rewardRatePerSecond)

        return sum.add(pendingReward)
    }, Big(0)).div(100000000)
}

export const getDailyBurnRate = async (player: PublicKey): Promise<Amounts> => {
    const fleets = await getAllFleetsForUserPublicKey(connection, player, fleetProgram)
    const dayInSeconds = 86400

    const resourcePerDay: Amounts = {
        food: Big(0),
        tool: Big(0),
        ammo: Big(0),
        fuel: Big(0)
    }

    await initOrderBook()
    await Promise.all(fleets.map(async (shipStakingInfo) => {
        const info = await getScoreVarsShipInfo(connection, fleetProgram, shipStakingInfo.shipMint)
        const remaining = getFleetRemainingResources(info, shipStakingInfo)

        resourcePerDay.food = resourcePerDay.food.add(Big(remaining.food.burnRatePerFleet).mul(dayInSeconds))
        resourcePerDay.tool = resourcePerDay.tool.add(Big(remaining.tool.burnRatePerFleet).mul(dayInSeconds))
        resourcePerDay.ammo = resourcePerDay.ammo.add(Big(remaining.ammo.burnRatePerFleet).mul(dayInSeconds))
        resourcePerDay.fuel = resourcePerDay.fuel.add(Big(remaining.fuel.burnRatePerFleet).mul(dayInSeconds))
    }))

    return resourcePerDay
}

const logStats = (balance: Amounts, dailyBurn: Amounts) => {
    logger.info(`TOOL balance: ${balance.tool}, burning ${dailyBurn.tool.toFixed(0)} per day, last for ${dailyBurn.tool.eq(0) ? 0 : dayjs.duration(balance.tool.div(dailyBurn.tool).toNumber(), 'day').humanize()}`)
    logger.info(`AMMO balance: ${balance.ammo}, burning ${dailyBurn.ammo.toFixed(0)} per day, last for ${dailyBurn.ammo.eq(0) ? 0 : dayjs.duration(balance.ammo.div(dailyBurn.ammo).toNumber(), 'day').humanize()}`)
    logger.info(`FOOD balance: ${balance.food}, burning ${dailyBurn.food.toFixed(0)} per day, last for ${dailyBurn.food.eq(0) ? 0 : dayjs.duration(balance.food.div(dailyBurn.food).toNumber(), 'day').humanize()}`)
    logger.info(`FUEL balance: ${balance.fuel}, burning ${dailyBurn.fuel.toFixed(0)} per day, last for ${dailyBurn.fuel.eq(0) ? 0 : dayjs.duration(balance.fuel.div(dailyBurn.fuel).toNumber(), 'day').humanize()}`)
}

export const stockResources = async (): Promise<void> => {
    const wallets = await Wallet.findBy({ enabled: true })

    const dailyBurn = (await Promise.all(wallets.map(wallet => getDailyBurnRate(new PublicKey(wallet.publicKey)))))
        .reduce((acc, cur) => ({
            tool: acc.tool.add(cur.tool),
            ammo: acc.ammo.add(cur.ammo),
            food: acc.food.add(cur.food),
            fuel: acc.fuel.add(cur.fuel)
        }), { ammo: Big(0), food: Big(0), fuel: Big(0), tool: Big(0) } as Amounts)

    const balance = await getResourceBalances(keyPair.publicKey)

    logStats(balance, dailyBurn)

    const amount: Amounts = {
        food: balance.food.lt(dailyBurn.food.mul(14)) ? dailyBurn.food.mul(21) : Big(0),
        ammo: balance.ammo.lt(dailyBurn.ammo.mul(14)) ? dailyBurn.ammo.mul(21) : Big(0),
        fuel: balance.fuel.lt(dailyBurn.fuel.mul(14)) ? dailyBurn.fuel.mul(21) : Big(0),
        tool: balance.tool.lt(dailyBurn.tool.mul(14)) ? dailyBurn.tool.mul(21) : Big(0)
    }

    if (amount.food.gt(0) || amount.ammo.gt(0) || amount.fuel.gt(0) || amount.tool.gt(0)) {
        const price = await getResourcePrices()
        const totalFuelPrice = amount.fuel.mul(price.fuel)
        const totalFoodPrice = amount.food.mul(price.food)
        const totalAmmoPrice = amount.ammo.mul(price.ammo)
        const totalToolPrice = amount.tool.mul(price.tool)
        const totalPrice = totalFuelPrice.add(totalFoodPrice).add(totalAmmoPrice).add(totalToolPrice)

        logger.info(`Buying Resources...${JSON.stringify(amount)} for ${totalPrice.toFixed(AD)} ATLAS`)

        const txs = await buyResources(amount)

        txs.forEach(tx => logger.info(tx))
        logStats(await getResourceBalances(keyPair.publicKey), dailyBurn)
    }
}
