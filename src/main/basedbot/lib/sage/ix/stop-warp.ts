import { InstructionReturn } from '@staratlas/data-source'
import { Fleet } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const stopWarpIx = (
    fleetInfo: FleetInfo,
    player: Player,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.moveWarpHandler(
        programs.sage,
        programs.points,
        player.profile.key,
        fleetInfo.fleet.key,
        player.xpAccounts.piloting.userPointsAccount,
        player.xpAccounts.piloting.pointsCategory,
        player.xpAccounts.piloting.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        player.game.key,
    )
