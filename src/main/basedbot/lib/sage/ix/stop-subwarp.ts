import { PublicKey } from '@solana/web3.js'
import { CargoStatsDefinition } from '@staratlas/cargo'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const stopSubWarpIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    cargoStatsDefinition: CargoStatsDefinition,
    fuelTokenAccount: PublicKey,
    fuelTokenMint: PublicKey,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.stopSubwarp(
        programs.sage,
        programs.cargo,
        programs.points,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        fleetInfo.fleet.data.fuelTank,
        player.fuelCargoType.key,
        cargoStatsDefinition.key,
        fuelTokenAccount,
        fuelTokenMint,
        player.xpAccounts.piloting.userPointsAccount,
        player.xpAccounts.piloting.pointsCategory,
        player.xpAccounts.piloting.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        game.key,
        game.data.gameState,
        {
            keyIndex: 0,
        },
    )
