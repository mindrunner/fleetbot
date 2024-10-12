import { PublicKey } from '@solana/web3.js'
import { InstructionReturn } from '@staratlas/data-source'
import { Fleet, Game } from '@staratlas/sage'

import { StarAtlasPrograms } from '../../programs'
import { getCargoType } from '../state/cargo-types'
import { Player } from '../state/user-account'
import { FleetInfo } from '../state/user-fleets'
import { Mineable } from '../state/world-map'

export const miningHandlerIx = (
    fleetInfo: FleetInfo,
    player: Player,
    mineable: Mineable,
    foodTokenFrom: PublicKey,
    ammoTokenFrom: PublicKey,
    resourceTokenFrom: PublicKey,
    resourceTokenTo: PublicKey,
    programs: StarAtlasPrograms,
    game: Game,
    // eslint-disable-next-line max-params
): InstructionReturn =>
    Fleet.asteroidMiningHandler(
        programs.sage,
        programs.cargo,
        fleetInfo.fleet.key,
        mineable.starbase.key,
        mineable.mineItem.key,
        mineable.resource.key,
        mineable.planet.key,
        fleetInfo.fleet.data.cargoHold,
        fleetInfo.fleet.data.ammoBank,
        player.foodCargoType.key,
        player.ammoCargoType.key,
        getCargoType(player.cargoTypes, game, mineable.mineItem.data.mint).key,
        game.data.cargo.statsDefinition,
        game.data.gameState,
        game.key,
        foodTokenFrom,
        ammoTokenFrom,
        resourceTokenFrom,
        resourceTokenTo,
        game.data.mints.food,
        game.data.mints.ammo,
    )
