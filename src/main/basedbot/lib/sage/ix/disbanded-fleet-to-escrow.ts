import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { DisbandedFleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const disbandedFleetToEscrowIx = (
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    shipEscrowIndex: number | null,
    disbandedFleet: PublicKey,
    fleetShips: PublicKey,
    shipKey: PublicKey,
    shipIndex: number,
    shipAmount: BN,
): InstructionReturn =>
    DisbandedFleet.disbandedFleetToEscrow(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        disbandedFleet,
        fleetShips,
        shipKey,
        starbasePlayer.key,
        starbase.key,
        game.key,
        game.data.gameState,
        {
            fleetShipInfoIndex: shipIndex,
            keyIndex: 0,
            shipAmount: shipAmount.toNumber(),
            shipEscrowIndex,
        },
    )
