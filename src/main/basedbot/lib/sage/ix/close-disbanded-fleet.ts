import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { DisbandedFleet } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { Player } from '../state/user-account'

export const closeDisbandedFleetIx = (
    player: Player,
    programs: StarAtlasPrograms,
    disbandedFleetKey: PublicKey,
    fleetShipsKey: PublicKey,
): InstructionReturn =>
    DisbandedFleet.closeDisbandedFleet(
        programs.sage,
        player.signer,
        player.profile.key,
        'funder',
        disbandedFleetKey,
        fleetShipsKey,
        { keyIndex: 0 },
    )
