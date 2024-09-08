import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const movementSubwarpHandlerIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    fuelTokenAccount: PublicKey,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.movementSubwarpHandler(
        programs.sage,
        programs.cargo,
        programs.points,
        player.profile.key,
        fleetInfo.fleet.key,
        fleetInfo.fleet.data.fuelTank,
        player.fuelCargoType.key,
        game.data.cargo.statsDefinition,
        fuelTokenAccount,
        game.data.mints.fuel,
        player.xpAccounts.piloting.userPointsAccount,
        player.xpAccounts.piloting.pointsCategory,
        player.xpAccounts.piloting.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        game.key,
    )
