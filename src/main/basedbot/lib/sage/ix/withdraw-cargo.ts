import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Game, Starbase, StarbasePlayer } from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'

export const withdrawCargoIx = (
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    cargoPodTo: PublicKey,
    tokenFrom: PublicKey,
    tokenTo: PublicKey,
    cargoType: PublicKey,
    mint: PublicKey,
    programs: StarAtlasPrograms,
    amount: BN,
): InstructionReturn =>
    StarbasePlayer.withdrawCargoFromGame(
        programs.sage,
        programs.cargo,
        starbasePlayer.key,
        player.signer,
        player.publicKey,
        player.profile.key,
        player.profileFaction.key,
        starbase.key,
        cargoPodTo,
        cargoType,
        game.data.cargo.statsDefinition,
        tokenFrom,
        tokenTo,
        mint,
        game.key,
        game.data.gameState,
        {
            amount,
            keyIndex: 0,
        },
    )
