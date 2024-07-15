import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Starbase, StarbasePlayer } from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const depositCargoIx = (
    player: Player,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    cargoPodTo: PublicKey,
    tokenFrom: PublicKey,
    tokenTo: PublicKey,
    cargoType: PublicKey,
    programs: StarAtlasPrograms,
    amount: BN,
    // eslint-disable-next-line max-params
): InstructionReturn =>
    StarbasePlayer.depositCargoToGame(
        programs.sage,
        programs.cargo,
        starbasePlayer.key,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        starbase.key,
        cargoPodTo,
        cargoType,
        player.game.data.cargo.statsDefinition,
        tokenFrom,
        tokenTo,
        player.game.key,
        player.game.data.gameState,
        {
            amount,
            keyIndex: 0,
        },
    )