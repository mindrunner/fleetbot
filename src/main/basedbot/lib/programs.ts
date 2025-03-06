import { Idl } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { CargoProgram } from '@staratlas/cargo'
import { Cargo } from '@staratlas/cargo/dist/src/idl/cargo'
import { CraftingProgram } from '@staratlas/crafting'
import { Crafting } from '@staratlas/crafting/dist/src/idl/crafting'
import { ProgramMethods } from '@staratlas/data-source'
import { PlayerProfileProgram } from '@staratlas/player-profile'
import { PlayerProfile } from '@staratlas/player-profile/dist/src/idl/player_profile'
import { PointsProgram } from '@staratlas/points'
import { Points } from '@staratlas/points/dist/src/idl/points'
import { ProfileFactionProgram } from '@staratlas/profile-faction'
import { ProfileFaction } from '@staratlas/profile-faction/dist/src/idl/profile_faction'
import { SageProgram } from '@staratlas/sage'
import { Sage } from '@staratlas/sage/dist/src/idl/sage'

import { config } from '../../../config'
import { anchorProvider } from '../../../service/sol/anchor'

// @ts-expect-error
export type StarAtlasProgram<T extends Idl> = ProgramMethods<T>

export const xpCategoryIds = config.sol.rpcEndpoint.includes('devnet')
    ? {
          dataRunningXpCategory: 'DXPsKQPMyaDtunxDWqiKTGWbQga3Wihck8zb8iSLATJQ',
          councilRankXpCategory: 'CRXPW3csNpkEYU5U4DUp6Ln6aEEWq4PSUAwV8v6Ygcqg',
          pilotingXpCategory: 'PXPfCZwu5Vuuj6aFdEUAXbxudDGeXVktTo6imwhZ5nC',
          miningXpCategory: 'MXPkuZz7yXvqdEB8pGtyNknqhxbCzJNQzqixoEiW4Q7',
          craftingXpCategory: 'CXPukKpixXCFPrfQmEUGR9VqnDvkUsKfPPLfdd4sKSH8',
          loyalityCategory: 'LPpdwMuXRuGMz298EMbNcUioaARN8CUU6dA2qyq46g8',
      }
    : {
          dataRunningXpCategory: 'DataJpxFgHhzwu4zYJeHCnAv21YqWtanEBphNxXBHdEY',
          councilRankXpCategory: 'XPneyd1Wvoay3aAa24QiKyPjs8SUbZnGg5xvpKvTgN9',
          pilotingXpCategory: 'PiLotBQoUBUvKxMrrQbuR3qDhqgwLJctWsXj3uR7fGs',
          miningXpCategory: 'MineMBxARiRdMh7s1wdStSK4Ns3YfnLjBfvF5ZCnzuw',
          craftingXpCategory: 'CraftndAV62acibnaW7TiwEYwu8MmJZBdyrfyN54nre7',
          loyalityCategory: '',
      }

const programIds = config.sol.rpcEndpoint.includes('devnet')
    ? {
          sage: 'sAgezwJpDb1aHvzNr3o24cKjsETmFEKghBEyJ1askDi',
          profile: 'PprofUW1pURCnMW2si88GWPXEEK3Bvh9Tksy8WtnoYJ',
          cargo: 'CArGoi989iv3VL3xArrJXmYYDNhjwCX5ey5sY5KKwMG',
          profileFaction: 'pFACzkX2eSpAjDyEohD6i3VRJvREtH9ynbtM1DwVFsj',
          crafting: 'CRAFtUSjCW74gQtCS6LyJH33rhhVhdPhZxbPegE4Qwfq',
          points: 'PointJfvuHi8DgGsPCy97EaZkQ6NvpghAAVkuquLf3w',
      }
    : {
          sage: 'SAGE2HAwep459SNq61LHvjxPk4pLPEJLoMETef7f7EE',
          profile: 'pprofELXjL5Kck7Jn5hCpwAL82DpTkSYBENzahVtbc9',
          cargo: 'Cargo2VNTPPTi9c1vq1Jw5d3BWUNr18MjRtSupAghKEk',
          profileFaction: 'pFACSRuobDmvfMKq1bAzwj27t6d2GJhSCHb1VcfnRmq',
          crafting: 'CRAFT2RPXPJWCEix4WpJST3E7NLf79GTqZUL75wngXo5',
          points: 'Point2iBvz7j5TMVef8nEgpmz4pDr7tU7v3RjAfkQbM',
      }

export type StarAtlasPrograms = {
    sage: StarAtlasProgram<Sage>
    points: StarAtlasProgram<Points>
    playerProfile: StarAtlasProgram<PlayerProfile>
    cargo: StarAtlasProgram<Cargo>
    profileFaction: StarAtlasProgram<ProfileFaction>
    crafting: StarAtlasProgram<Crafting>
}

export const programs: StarAtlasPrograms = {
    sage: SageProgram.buildProgram(
        new PublicKey(programIds.sage),
        anchorProvider,
    ),
    points: PointsProgram.buildProgram(
        new PublicKey(programIds.points),
        anchorProvider,
    ),
    playerProfile: PlayerProfileProgram.buildProgram(
        new PublicKey(programIds.profile),
        anchorProvider,
    ),
    cargo: CargoProgram.buildProgram(
        new PublicKey(programIds.cargo),
        anchorProvider,
    ),
    profileFaction: ProfileFactionProgram.buildProgram(
        new PublicKey(programIds.profileFaction),
        anchorProvider,
    ),
    crafting: CraftingProgram.buildProgram(
        new PublicKey(programIds.crafting),
        anchorProvider,
    ),
}
