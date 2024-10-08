import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

type DisbandFleetReturn = {
    disbandedFleetKey: [PublicKey, number]
    instructions: InstructionReturn
}

export const disbandFleetIx = (
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    fleet: Fleet,
    // eslint-disable-next-line max-params
): DisbandFleetReturn =>
    Fleet.disbandFleet(
        programs.sage,
        programs.cargo,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleet,
        starbasePlayer.key,
        starbase.key,
        game.key,
        game.data.gameState,
        {
            keyIndex: 0,
        },
    )
