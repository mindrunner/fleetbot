import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
    createAssociatedTokenAccount,
    InstructionReturn,
    ixReturnsToIxs,
} from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { connection } from '../../../../../service/sol'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { Coordinates } from '../../util/coordinates'
import { scanIx } from '../ix/scan'
import { getCargoTypes } from '../state/cargo-types'
import { getSectors } from '../state/get-sectors'
import { getSurveyDataUnitTracker } from '../state/get-survey-data-unit-tracker'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const scan = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
): Promise<void> => {
    const [surveyDataUnitTracker] = await getSurveyDataUnitTracker(game)

    if (!surveyDataUnitTracker) {
        throw new Error('No SurveyDataUnitTracker found')
    }
    const { sduMint, resourceMint } = surveyDataUnitTracker.data

    const sduTokenTo = getAssociatedTokenAddressSync(
        sduMint,
        fleetInfo.fleet.data.cargoHold,
        true,
    )
    const sduTokenToAccount = await connection.getAccountInfo(sduTokenTo)

    const ixs: Array<InstructionReturn> = []

    if (!sduTokenToAccount) {
        ixs.push(
            createAssociatedTokenAccount(
                sduMint,
                fleetInfo.fleet.data.cargoHold,
                true,
            ).instructions,
        )
        logger.info(
            `Creating Survey Data Unit token account for ${fleetInfo.fleetName}}`,
        )
    }
    const cargoTypes = await getCargoTypes()
    const resourceCargoType = cargoTypes.find((c) =>
        c.data.mint.equals(resourceMint),
    )

    if (!resourceCargoType) throw new Error('Resource Cargo Type not found')
    const sduCargoType = cargoTypes.find((c) => c.data.mint.equals(sduMint))

    if (!sduCargoType) throw new Error('SDU Cargo Type not found')

    const sectors = await getSectors(game)

    const sector = sectors.find((s) =>
        Coordinates.fromString(s.data.coordinates.toString()).equals(
            fleetInfo.location,
        ),
    )

    if (!sector) throw new Error('Sector not found')

    ixs.push(
        scanIx(
            fleetInfo,
            player,
            game,
            programs,
            sector.key,
            surveyDataUnitTracker,
            sduTokenTo,
            sduCargoType.key,
            resourceCargoType?.key,
        ),
    )

    await ixReturnsToIxs(ixs, player.signer).then(sendAndConfirmInstructions)
}
