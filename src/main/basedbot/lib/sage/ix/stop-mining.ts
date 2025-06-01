import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'
import { Mineable } from '../state/world-map.js'

export const stopMiningIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    mineable: Mineable,
    fuelTokenAccount: PublicKey,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.stopMiningAsteroid(
        programs.sage,
        programs.cargo,
        programs.points,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        mineable.mineItem.key,
        mineable.resource.key,
        mineable.planet.key,
        fleetInfo.fleet.data.fuelTank,
        player.fuelCargoType.key,
        game.data.cargo.statsDefinition,
        player.xpAccounts.mining.userPointsAccount,
        player.xpAccounts.mining.pointsCategory,
        player.xpAccounts.mining.pointsModifierAccount,
        player.xpAccounts.piloting.userPointsAccount,
        player.xpAccounts.piloting.pointsCategory,
        player.xpAccounts.piloting.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        game.data.gameState,
        game.key,
        fuelTokenAccount,
        game.data.mints.fuel,
        {
            keyIndex: player.keyIndex,
        },
    )
