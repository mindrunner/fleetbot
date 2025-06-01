import { PublicKey } from '@solana/web3.js'
import { CargoStatsDefinition } from '@staratlas/cargo'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs.js'
import { FleetInfo } from '../state/user-fleets.js'

export const forceDropFleetCargoIx = (
    fleetInfo: FleetInfo,
    game: Game,
    cargoStatsDefinition: CargoStatsDefinition,
    cargoPod: PublicKey,
    cargoType: PublicKey,
    tokenFrom: PublicKey,
    tokenMint: PublicKey,
    programs: StarAtlasPrograms,
): InstructionReturn =>
    Fleet.forceDropFleetCargo(
        programs.sage,
        programs.cargo,
        fleetInfo.fleet.key,
        cargoPod,
        cargoType,
        cargoStatsDefinition.key,
        game.key,
        tokenFrom,
        tokenMint,
    )
