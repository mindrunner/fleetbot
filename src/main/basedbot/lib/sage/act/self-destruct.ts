import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { ixReturnsToIxs } from '@staratlas/data-source'
import { Game } from '@staratlas/sage'

import { logger } from '../../../../../logger.js'
import { sendAndConfirmInstructions } from '../../../../../service/sol/send-and-confirm-tx.js'
import { programs } from '../../programs.js'
import { idleToRespawnIx } from '../ix/idle-to-respawn.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

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
