import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const idleToRespawnIx = (
    player: Player,
    game: Game,
    fleet: Fleet,
    atlasTokenFrom: PublicKey,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.idleToRespawn(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleet.key,
        atlasTokenFrom,
        game.data.vaults.atlas,
        game.data.gameState,
        game.key,
        { keyIndex: 0 },
    )
