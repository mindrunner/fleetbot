import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Game, SurveyDataUnitTracker } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const scanIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    programs: StarAtlasPrograms,
    sector: PublicKey,
    surveyDataUnitTracker: SurveyDataUnitTracker,
    sduTokenTo: PublicKey,
    sduCargoType: PublicKey,
    resourceCargoType: PublicKey,
    // eslint-disable-next-line max-params
): InstructionReturn =>
    SurveyDataUnitTracker.scanForSurveyDataUnits(
        programs.sage,
        programs.cargo,
        programs.points,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        fleetInfo.fleet.key,
        sector,
        new PublicKey(surveyDataUnitTracker.key),
        fleetInfo.fleet.data.cargoHold,
        sduCargoType,
        resourceCargoType,
        getAssociatedTokenAddressSync(
            surveyDataUnitTracker.data.sduMint,
            surveyDataUnitTracker.data.signer,
            true,
        ),
        sduTokenTo,
        getAssociatedTokenAddressSync(
            surveyDataUnitTracker.data.resourceMint,
            fleetInfo.fleet.data.cargoHold,
            true,
        ),
        surveyDataUnitTracker.data.resourceMint,

        game.data.cargo.statsDefinition,
        player.xpAccounts.dataRunning.userPointsAccount,
        player.xpAccounts.dataRunning.pointsCategory,
        player.xpAccounts.dataRunning.pointsModifierAccount,
        player.xpAccounts.councilRank.userPointsAccount,
        player.xpAccounts.councilRank.pointsCategory,
        player.xpAccounts.councilRank.pointsModifierAccount,
        game.key,
        game.data.gameState,
        {
            keyIndex: 0,
        },
    )
