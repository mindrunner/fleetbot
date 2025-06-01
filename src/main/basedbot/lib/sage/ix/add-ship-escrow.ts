import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import {
    Game,
    SagePlayerProfile,
    Starbase,
    StarbasePlayer,
} from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'

export const addShipEscrowIx = (
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    sagePlayerProfile: PublicKey,
    programs: StarAtlasPrograms,
    originTokenAccount: PublicKey,
    ship: PublicKey,
    shipEscrowTokenAccount: PublicKey,
    shipAmount: BN,
    escrowIndex: number | null,
): InstructionReturn =>
    SagePlayerProfile.addShipEscrow(
        programs.sage,
        player.profile.key,
        player.profileFaction.key,
        sagePlayerProfile,
        player.signer,
        originTokenAccount,
        ship,
        shipEscrowTokenAccount,
        starbasePlayer.key,
        starbase.key,
        game.key,
        game.data.gameState,
        {
            shipAmount,
            index: escrowIndex,
        },
    )
