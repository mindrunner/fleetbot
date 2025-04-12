import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { ixReturnsToIxs } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx'
import { programs } from '../../programs'
import { idleToRespawnIx } from '../ix/idle-to-respawn'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'

export const selfDestruct = async (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
): Promise<void> => {
    const { fleet } = fleetInfo

    // TODO: Also support self-destruct for mining fleets
    if (!fleet.state.Idle) {
        logger.warn('Only Idle Fleets can self destruct')

        return
    }
    const atlasTokenFrom = getAssociatedTokenAddressSync(
        game.data.mints.atlas,
        player.signer.publicKey(),
    )

    await ixReturnsToIxs(
        idleToRespawnIx(player, game, fleet, atlasTokenFrom, programs),
        player.signer,
    ).then(sendAndConfirmInstructions())
}
