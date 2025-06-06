import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game, Starbase, StarbasePlayer } from '@staratlas/sage'
import BN from 'bn.js'

import { StarAtlasPrograms } from '../../programs.js'
import { Player } from '../state/user-account.js'
import { FleetInfo } from '../state/user-fleets.js'

export const loadCargoIx = (
    fleetInfo: FleetInfo,
    player: Player,
    game: Game,
    starbase: Starbase,
    starbasePlayer: StarbasePlayer,
    cargoPodFrom: PublicKey,
    cargoPodTo: PublicKey,
    tokenFrom: PublicKey,
    tokenTo: PublicKey,
    tokenMint: PublicKey,
    cargoType: PublicKey,
    programs: StarAtlasPrograms,
    amount: BN,
): InstructionReturn =>
    Fleet.depositCargoToFleet(
        programs.sage,
        programs.cargo,
        player.signer,
        player.profile.key,
        player.profileFaction.key,
        'funder',
        starbase.key,
        starbasePlayer.key,
        fleetInfo.fleet.key,
        cargoPodFrom,
        cargoPodTo,
        cargoType,
        game.data.cargo.statsDefinition,
        tokenFrom,
        tokenTo,
        tokenMint,
        game.key,
        game.data.gameState,
        {
            amount,
            keyIndex: 0,
        },
    )
