import { InstructionReturn } from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { Mineable } from '../state/world-map'

export const stopMiningIx = (
    fleetInfo: FleetInfo,
    player: Player,
    mineable: Mineable,
    programs: StarAtlasPrograms,
    // eslint-disable-next-line max-params
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
        player.game.data.cargo.statsDefinition,
        player.xpAccounts.mining.userPointsAccount,
        player.xpAccounts.mining.pointsCategory,
        player.xpAccounts.mining.pointsModifierAccount,
        player.xpAccounts.piloting.userPointsAccount,
        player.xpAccounts.piloting.pointsCategory,
        player.xpAccounts.piloting.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        player.game.data.gameState,
        player.game.key,
        fleetInfo.fuelTokenAccount,
        player.game.data.mints.fuel,
        {
            keyIndex: player.keyIndex,
        },
    )
