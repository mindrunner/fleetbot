import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { SagePlayerProfile, Starbase, StarbasePlayer } from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const addShipIx = (
    player: Player,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    originTokenAccount: PublicKey,
    ship: PublicKey,
    shipEscrowTokenAccount: PublicKey,
    shipAmount: BN,
    // eslint-disable-next-line max-params
): InstructionReturn =>
    SagePlayerProfile.addShipEscrow(
        programs.sage,
        player.profile.key,
        player.profileFaction.key,
        player.profile.key,
        player.signer,
        originTokenAccount,
        ship,
        shipEscrowTokenAccount,
        starbasePlayer.key,
        starbase.key,
        player.game.key,
        player.game.data.gameState,
        {
            shipAmount,
            index: 0,
        },
    )