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

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { Faction, galaxySectorsData } from '../../util/galaxy-sectors-data'

import { getCargoType, getCargoTypes } from './cargo-types'
import { sageGame } from './game'
import { starbaseByCoordinates } from './starbase-by-coordinates'

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

    // TODO: only support one profile for now

    const [profile] = myProfiles

    if (!profile) {
        throw new Error('no player profile found')
    }

    if (profile.type === 'error') {
        throw new Error('Error reading account')
    }

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
    const game = await sageGame()

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
    }
}
