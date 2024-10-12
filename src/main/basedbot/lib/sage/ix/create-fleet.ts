import { PublicKey } from '@solana/web3.js'
import { InstructionReturn, stringToByteArray } from '@staratlas/data-source'
import { Fleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'

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
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    ship: PublicKey,
    cargoStatsDefinition: PublicKey,
    shipAmount: number,
    name: string,
    shipEscrowIndex: number,
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
        game.key,
        game.data.gameState,
        cargoStatsDefinition,
        {
            shipAmount,
            fleetLabel: stringToByteArray(name, 32),
            shipEscrowIndex,
            keyIndex: 0,
        },
    )
