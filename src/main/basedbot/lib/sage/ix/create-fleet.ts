import { PublicKey } from '@solana/web3.js'
import { InstructionReturn, stringToByteArray } from '@staratlas/data-source'
import { Fleet, Starbase, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

type CreateFleetReturn = {
    fleetKey: [PublicKey, number]
    cargoHoldKey: [PublicKey, number]
    fuelTankKey: [PublicKey, number]
    ammoBankKey: [PublicKey, number]
    instructions: InstructionReturn
}

export const createFleetIx = (
    player: Player,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    ship: PublicKey,
    shipEscrowIndex: number,
    cargoStatsDefinition: PublicKey,
    shipAmount: number,
    name: string,
    // eslint-disable-next-line max-params
): CreateFleetReturn =>
    Fleet.createFleet(
        programs.sage,
        programs.cargo,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        ship,
        starbasePlayer.key,
        starbase.key,
        player.game.key,
        player.game.data.gameState,
        cargoStatsDefinition,
        {
            shipAmount,
            fleetLabel: stringToByteArray(name, 32),
            shipEscrowIndex,
            keyIndex: 0,
        },
    )
