import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Starbase, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const dockIx = (
    fleetInfo: FleetInfo,
    player: Player,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.idleToLoadingBay(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        starbase.key,
        starbasePlayer.key,
        player.game.key,
        player.game.data.gameState,
        player.keyIndex,
    )
