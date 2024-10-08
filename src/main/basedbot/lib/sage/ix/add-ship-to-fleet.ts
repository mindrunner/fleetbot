import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const addShipToFleetIx = (
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    fleet: PublicKey,
    ship: PublicKey,
    shipAmount: number,
    shipEscrowIndex: number,
): InstructionReturn =>
    Fleet.addShipToFleet(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleet,
        ship,
        starbasePlayer.key,
        starbase.key,
        game.key,
        game.data.gameState,
        {
            shipAmount,
            shipEscrowIndex,
            keyIndex: 0,
            fleetShipInfoIndex: null,
        },
    )
