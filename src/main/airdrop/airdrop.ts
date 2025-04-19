import { PublicKey } from '@solana/web3.js'
import { readAllFromRPC } from '@staratlas/data-source'
import { PlayerProfile } from '@staratlas/player-profile'
import { CronJob } from 'cron'

import { config } from '../../config'
import { airdrop } from '../../lib/airdrop'
import { logger } from '../../logger'
import { connection } from '../../service/sol'
import { programs } from '../basedbot/lib/programs'
import { sageGame } from '../basedbot/lib/sage/state/game'
import { Faction } from '../basedbot/lib/util/galaxy-sectors-data'
import { createAndInitializeCharacter } from '../basedbot/lib/util/profile'

let airdropCronJob: CronJob | undefined

export const create = async (): Promise<void> => {
    logger.info('Starting airdrop...')
}

export const stop = async (): Promise<void> => {
    try {
        logger.info('Stopping airdrop...')
        if (airdropCronJob) {
            airdropCronJob.stop()
        }
    } catch (e) {
        logger.error(e)
    }
}

const airdropOrCreateProfile = async (user: PublicKey): Promise<void> => {
    const myProfiles = await readAllFromRPC(
        connection,
        programs.playerProfile,
        PlayerProfile,
        'processed',
        [
            {
                memcmp: {
                    offset: PlayerProfile.MIN_DATA_SIZE + 2,
                    bytes: user.toBase58(),
                },
            },
        ],
    )
    const game = await sageGame()

    if (myProfiles.length > 0) {
        logger.info(
            `Airdropping to ${user.toBase58()} with profile ${myProfiles[0].key.toBase58()}`,
        )
        await airdrop(
            config.app.airdropUrl,
            config.app.airdropToken,
            new PublicKey(user),
        )
    } else {
        logger.info(`Creating profile for ${user.toBase58()}`)
        await createAndInitializeCharacter(game, 'fleetbot', Faction.ONI)
    }
}

const airdropTick = async (): Promise<void> => {
    await Promise.all(
        config.app.airdropWallets.map((w) =>
            airdropOrCreateProfile(new PublicKey(w)),
        ),
    )
}

export const start = async (): Promise<void> => {
    airdropCronJob = CronJob.from({
        cronTime: config.cron.airdropInterval,
        onTick: airdropTick,
        runOnInit: config.app.quickstart,
        start: true,
    })
}
