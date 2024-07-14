import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { Mineable } from '../state/world-map'

export const startMiningIx = (
    fleetInfo: FleetInfo,
    player: Player,
    mineable: Mineable,
    starbasePlayer: StarbasePlayer,
    programs: StarAtlasPrograms,
    // eslint-disable-next-line max-params
): InstructionReturn =>
    Fleet.startMiningAsteroid(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        mineable.starbase.key,
        starbasePlayer.key,
        mineable.mineItem.key,
        mineable.resource.key,
        mineable.planet.key,
        player.game.data.gameState,
        player.game.key,
        fleetInfo.fuelTokenAccount,
        {
            keyIndex: player.keyIndex,
        },
    )
