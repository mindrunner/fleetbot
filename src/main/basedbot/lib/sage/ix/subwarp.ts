import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const subWarpIx = (
    fleetInfo: FleetInfo,
    coordinates: Coordinates,
    _fuelTokenAccount: PublicKey,
    player: Player,
    game: Game,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.startSubwarp(
        programs.sage,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        game.key,
        game.data.gameState,
        {
            toSector: coordinates.toArray(),
            keyIndex: player.keyIndex,
        },
    )
