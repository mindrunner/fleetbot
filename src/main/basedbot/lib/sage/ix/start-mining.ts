import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game, StarbasePlayer } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'
import { Mineable } from '../state/world-map.js'

export const startMiningIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mineable: Mineable,
    starbasePlayer: StarbasePlayer,
    fuelTokenAccount: PublicKey,
    programs: StarAtlasPrograms,
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
        game.data.gameState,
        game.key,
        fuelTokenAccount,
        {
            keyIndex: player.keyIndex,
        },
    )
