import { Keypair, PublicKey } from '@solana/web3.js'
import { CargoType } from '@staratlas/cargo'
import {
    AsyncSigner,
    keypairToAsyncSigner,
    readAllFromRPC,
} from '@staratlas/data-source'
import { PlayerProfile } from '@staratlas/player-profile'
import { UserPoints } from '@staratlas/points'
import { ProfileFactionAccount } from '@staratlas/profile-faction'
import { SagePointsCategory, Starbase } from '@staratlas/sage'
import { config } from '../../../../../config/index.js'
import { logger } from '../../../../../logger.js'

import { connection } from '../../../../../service/sol/index.js'
import { programs } from '../../programs.js'
import { Coordinates } from '../../util/coordinates.js'
import { Faction, galaxySectorsData } from '../../util/galaxy-sectors-data.js'
import { createAndInitializeCharacter } from '../../util/profile.js'
import { ExtShipData, getShipData } from '../ships.js'

import { getCargoType, getCargoTypes } from './cargo-types.js'
import { sageGame } from './game.js'
import { starbaseByCoordinates } from './starbase-by-coordinates.js'

export type XpAccounts = {
    councilRank: XpAccount
    dataRunning: XpAccount
    piloting: XpAccount
    mining: XpAccount
    crafting: XpAccount
}

export type XpAccount = {
    userPointsAccount: PublicKey
    pointsCategory: PublicKey
    pointsModifierAccount: PublicKey
}

export type Player = {
    publicKey: PublicKey
    keyIndex: number
    profile: PlayerProfile
    profileFaction: ProfileFactionAccount
    faction: Faction
    xpAccounts: XpAccounts
    signer: AsyncSigner
    homeStarbase: Starbase
    homeCoordinates: Coordinates
    cargoTypes: Array<CargoType>
    fuelCargoType: CargoType
    foodCargoType: CargoType
    ammoCargoType: CargoType
    shipData: Array<ExtShipData>
}

const getXpAccount = (
    playerProfile: PublicKey,
    pointsCategory: SagePointsCategory,
): XpAccount => {
    const pointsCategoryKey = pointsCategory.category
    const pointsModifierAccount = pointsCategory.modifier
    const [userPointsAccount] = UserPoints.findAddress(
        programs.points,
        pointsCategoryKey,
        playerProfile,
    )

    return {
        userPointsAccount,
        pointsModifierAccount,
        pointsCategory: pointsCategoryKey,
    }
}

const getKeyIndex = (_: PlayerProfile): number => 0

export const getPlayerContext = async (
    user: PublicKey,
    signer: Keypair,
): Promise<Player> => {
    const myProfiles = await readAllFromRPC(
        connection,
        programs.playerProfile,
        PlayerProfile,
        'processed',
        [
            {
                memcmp: {
                    offset: PlayerProfile.MIN_DATA_SIZE + 2,
                    bytes: user.toBase58(),
                },
            },
        ],
    )
    const game = await sageGame()

    const [profile] =
        myProfiles.length > 0
            ? myProfiles
            : config.app.autoCreateProfile
              ? await createAndInitializeCharacter(
                    game,
                    'fleetbot',
                    Faction.ONI,
                )
              : []

    if (!profile) {
        throw new Error('no player profile found')
    }

    if (profile.type === 'error') {
        throw new Error('Error reading account')
    }

    logger.info(`Player profile: ${profile.key}`)

    const keyIndex = getKeyIndex(profile.data)

    const [profileFaction] = await readAllFromRPC(
        connection,
        programs.profileFaction as any,
        ProfileFactionAccount,
        'processed',
        [
            {
                memcmp: {
                    offset: 9,
                    bytes: profile.key.toBase58(),
                },
            },
        ],
    )

    if (profileFaction.type === 'error') {
        throw new Error('Error reading faction account')
    }

    const xpAccounts = {
        councilRank: getXpAccount(
            profile.key,
            game.data.points.councilRankXpCategory,
        ),
        dataRunning: getXpAccount(
            profile.key,
            game.data.points.dataRunningXpCategory,
        ),
        piloting: getXpAccount(profile.key, game.data.points.pilotXpCategory),
        mining: getXpAccount(profile.key, game.data.points.miningXpCategory),
        crafting: getXpAccount(
            profile.key,
            game.data.points.craftingXpCategory,
        ),
    }

    const cargoTypes = await getCargoTypes()

    const homeCoordinates = galaxySectorsData()
        .filter(
            (sector) =>
                sector.closestFaction === profileFaction.data.data.faction,
        )
        .find((sector) => sector.name.includes('CSS'))?.coordinates

    if (!homeCoordinates) {
        throw new Error('No home coordinates found')
    }

    const homeStarbase = await starbaseByCoordinates(homeCoordinates)

    if (!homeStarbase) {
        throw new Error('No home starbase found')
    }
    const shipData = await getShipData(game)

    return {
        publicKey: user,
        profile: profile.data,
        profileFaction: profileFaction.data,
        faction: profileFaction.data.data.faction,
        keyIndex,
        xpAccounts,
        signer: keypairToAsyncSigner(signer),
        homeCoordinates,
        cargoTypes,
        homeStarbase,
        fuelCargoType: getCargoType(cargoTypes, game, game.data.mints.fuel),
        foodCargoType: getCargoType(cargoTypes, game, game.data.mints.food),
        ammoCargoType: getCargoType(cargoTypes, game, game.data.mints.ammo),
        shipData,
    }
}
