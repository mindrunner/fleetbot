import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const exitRespawnIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.respawnToLoadingBay(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        starbase.key,
        starbasePlayer.key,
        fleetInfo.fleet.data.cargoHold,
        fleetInfo.fleet.data.fuelTank,
        fleetInfo.fleet.data.ammoBank,
        game.key,
        game.data.gameState,
        {
            keyIndex: 0,
        },
    )
