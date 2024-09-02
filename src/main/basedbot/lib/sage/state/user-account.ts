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
import { Game, SagePointsCategory, Starbase } from '@staratlas/sage'

import { connection } from '../../../../../service/sol'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'

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
    xpAccounts: XpAccounts
    signer: AsyncSigner
    game: Game
    homeStarbase: Starbase
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    let homeCoords

    //TODO: add correct Coordinates for each faction
    switch (profileFaction.data.data.faction) {
        case 0:
            homeCoords = Coordinates.fromNumber(0, 0)
            break
        case 1:
            homeCoords = Coordinates.fromNumber(0, 0)
            break
        case 2:
            homeCoords = Coordinates.fromNumber(-40, 30)
            break
        default:
            throw new Error('Unknown faction')
    }

    const homeStarbase = await starbaseByCoordinates(homeCoords)

    if (!homeStarbase) {
        throw new Error('No home starbase found')
    }

    return {
        publicKey: user,
        profile: profile.data,
        profileFaction: profileFaction.data,
        keyIndex,
        xpAccounts,
        signer: keypairToAsyncSigner(signer),
        game,
        cargoTypes,
        homeStarbase,
        fuelCargoType: getCargoType(cargoTypes, game, game.data.mints.fuel),
        foodCargoType: getCargoType(cargoTypes, game, game.data.mints.food),
        ammoCargoType: getCargoType(cargoTypes, game, game.data.mints.ammo),
    }
}
