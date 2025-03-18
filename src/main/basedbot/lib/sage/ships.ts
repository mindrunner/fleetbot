import { PublicKey } from '@solana/web3.js'
import { Game, Ship } from '@staratlas/sage'
import { programs } from '../programs'
import { getShipByMint } from './state/starbase-player'

export enum VZUS {
    Opod = 'VZUSOP',
    Ambwe = 'VZUSAM',
    Ballad = 'VZUSBA',
    Solos = 'VZUSSO',
}

export enum Pearce {
    X5 = 'PX5',
    F4 = 'PF4',
    R8 = 'PR8',
    C11 = 'PC11',
    X6 = 'PX6',
    X4 = 'PX4',
    C9 = 'PC9',
    R6 = 'PR6',
    D9 = 'PD9',
    T1 = 'T1TAN',
}

export enum Ogrika {
    Thripid = 'OGKATP',
    JodAsteris = 'OGKAJA',
    Mik = 'OGKAMK',
    Tursik = 'OGKATU',
    Sunpaa = 'OGKASP',
    Niruch = 'OGKANR',
    Ruch = 'OGKARU',
}

export enum Opal {
    JetJet = 'OPALJJ',
    Jet = 'OPALJ',
    Bitboat = 'OPALBB',
    RayFam = 'OPALRF',
}

export enum Fimbul {
    Airbike = 'FBLAIR',
    Lowbie = 'FBLLOW',
    Mamba = 'FBLMAM',
    MambaEX = 'FBLMEX',
    Sledbarge = 'FBLSLE',
}

export enum FimbulECOS {
    Greenader = 'FBLEGR',
    TreeArrow = 'FBLETR',
    Bombarella = 'FBLEBO',
    Unibomba = 'FBLEUN',
    Superphoenix = 'SUPER',
}

export enum FimbulBYOS {
    Earp = 'FBLBEA',
    Packlite = 'FBLBPL',
    Tankship = 'FBLBTA',
    Butch = 'FBLBBU',
    Ranger = 'FBLBRA',
}

export enum Rainbow {
    Chi = 'CHI',
    Om = 'OM',
    Arc = 'ARC',
    Phi = 'PHI',
}

export enum Calico {
    Evac = 'CALEV',
    Guardian = 'CALG',
    CompaktHero = 'CALCH',
    Medtech = 'CALMED',
    AtsEnforcer = 'CALATS',
    Scud = 'CALSCD',
    Maxhog = 'CALMAX',
    Shipit = 'CALSHIP',
}

export enum Tufa {
    Feist = 'TUFAFE',
}

export enum Busan {
    ThrillOfLife = 'THRILL',
    MaidenHeart = 'HEART',
    TheLastStand = 'STAND',
    Pulse = 'PULSE',
}

export enum Armstrong {
    Tip = 'IMP1',
    Tap = 'IMP2',
    IMP = 'IMP3',
}

export enum DevShip {
    Test = 'Test',
}

export type ShipSymbol =
    | VZUS
    | Pearce
    | Ogrika
    | Opal
    | Fimbul
    | FimbulECOS
    | FimbulBYOS
    | Rainbow
    | Calico
    | Tufa
    | Busan
    | Armstrong
    | DevShip

interface ShipData {
    name: string
    role: ShipRole
    mint: PublicKey
}

interface ExtShipData {
    name: string
    role: ShipRole
    mint: PublicKey
    ship: Ship
    size: number
}

interface ShipMap {
    [key: string]: ShipData
}

export interface ExtShipMap {
    [key: string]: ExtShipData
}

export enum ShipRole {
    MINER,
    FIGHTER,
    RACER,
    TRANSPORT,
    RESCUE,
    MULTI,
    BOMBER,
    BOUNTYHUNT,
    DATARUNNER,
    REFUELREPAIR,
    SALVAGE,
    REPAIR,
}

export const getShipData = async (
    game: Game,
    shipMap: ShipMap,
): Promise<ExtShipMap> => {
    const shipEntries = await Promise.all(
        Object.entries(shipMap).map(async ([key, value]) => {
            const ship = await getShipByMint(value.mint, game, programs)
            const size = ship.data.sizeClass ** 2
            return [
                key,
                {
                    name: value.name,
                    role: value.role,
                    mint: value.mint,
                    ship: ship,
                    size,
                },
            ]
        }),
    )

    return Object.fromEntries(shipEntries) as ExtShipMap
}

export const ships: ShipMap = {
    [Pearce.X4]: {
        name: 'Pearce X4',
        mint: new PublicKey('CWvsu7kmgCDhi1bWBqA9N4NKkhpDV6heTb5T3we54zrt'),
        role: ShipRole.FIGHTER,
    },
    [Opal.JetJet]: {
        name: 'Opal Jetjet',
        mint: new PublicKey('5o635z1vCTUxQF5qVgsbSVB3EKMThGA1Y6giyrhTpLJj'),
        role: ShipRole.RACER,
    },
    [Rainbow.Om]: {
        name: 'Rainbow Om',
        mint: new PublicKey('7feVdv745gGxZYKb5JEe84EGCJ6nGyMYtPng2wQRfrdh'),
        role: ShipRole.TRANSPORT,
    },
    [Tufa.Feist]: {
        name: 'Tufa Feist',
        mint: new PublicKey('2K7rLcoTsx2pS5KV1LW6wmRdu7GKxUn9azx6iUXY87fS'),
        role: ShipRole.FIGHTER,
    },
    [FimbulECOS.Greenader]: {
        name: 'Fimbul ECOS Greenader',
        mint: new PublicKey('2bkoL87tqVzgwGcRjqm5vk3RGjd5Mpay81dx88huU4e5'),
        role: ShipRole.BOMBER,
    },
    [FimbulECOS.Bombarella]: {
        name: 'Fimbul ECOS Bombarella',
        mint: new PublicKey('32K2GbxgmMWAvdztdY96NYD7eucpk95rbK2wVgh2vFRo'),
        role: ShipRole.BOMBER,
    },
    [FimbulBYOS.Tankship]: {
        name: 'Fimbul BYOS Tankship',
        mint: new PublicKey('7pW9NHhuHCP2rBhwE23B6v5bwrfmvGmgg1LgPSVpTxZv'),
        role: ShipRole.FIGHTER,
    },
    [FimbulBYOS.Butch]: {
        name: 'Fimbul BYOS Butch',
        mint: new PublicKey('BBUPJXjgwBhHXrsQoLw4oCk2DrVR8sFYjCo7MjNjH2NE'),
        role: ShipRole.FIGHTER,
    },
    [Fimbul.Mamba]: {
        name: 'Fimbul Mamba',
        mint: new PublicKey('En3uuAwxMFFKH382Xkr24LVKjs8e25NZXUV3FBkjnmuX'),
        role: ShipRole.BOUNTYHUNT,
    },
    [Pearce.X5]: {
        name: 'Pearce X5',
        mint: new PublicKey('7CBrGuHSpRvLgQMwA2Vbe9ra9nsg2K9FUDH3TpMmjFdA'),
        role: ShipRole.FIGHTER,
    },
    [Ogrika.Thripid]: {
        name: 'Ogrika Thripid',
        mint: new PublicKey('8Tt2ec8HKmwqr1wxKVwizmcvdJQos2B42faDyyinjFti'),
        role: ShipRole.FIGHTER,
    },
    [Ogrika.Sunpaa]: {
        name: 'Ogrika Sunpaa',
        mint: new PublicKey('8mQpeQjw8zqxFDKV3iHdkec7DMh4uJD52kHESitKXs2f'),
        role: ShipRole.TRANSPORT,
    },
    [VZUS.Opod]: {
        name: 'VZUS Opod',
        mint: new PublicKey('4YRhx9VQR4TvscsAcvUjJZPjiT6vAjAQDrDo1pJR5RVF'),
        role: ShipRole.DATARUNNER,
    },
    [FimbulBYOS.Packlite]: {
        name: 'Fimbul BYOS Packlite',
        mint: new PublicKey('8BA19uTEFGPLHYHaGhJBd3y4rJtZgsA37HFDoPZ9wgzv'),
        role: ShipRole.TRANSPORT,
    },
    [Calico.Guardian]: {
        name: 'Calico Guardian',
        mint: new PublicKey('EyUcVag89Lx7rpJLZctPYwHiSJpk8TM411bqgpeKcS5n'),
        role: ShipRole.MULTI,
    },
    [Calico.CompaktHero]: {
        name: 'Calico Compakt Hero',
        mint: new PublicKey('9jTjPB8rGNEBC5HzM49ZfqN1F8xQLUeuRVNeh3DFGHbh'),
        role: ShipRole.MULTI,
    },
    [Opal.Jet]: {
        name: 'Opal Jet',
        mint: new PublicKey('5tyJwmNjzHusouZxsaMjSkLna9VeeJkg2FRaDXLRFQSk'),
        role: ShipRole.RACER,
    },
    [Pearce.C11]: {
        name: 'Pearce C11',
        mint: new PublicKey('6whMv9uPMG3mPXcCgDaqFg6TaN4KZM1m3BmjGJXJRvco'),
        role: ShipRole.FIGHTER,
    },
    [Pearce.F4]: {
        name: 'Pearce F4',
        mint: new PublicKey('HUxaWGNGgZSEVpB2Epgx2zYHgi7KxP8atApkmdnsng2s'),
        role: ShipRole.FIGHTER,
    },
    [VZUS.Ambwe]: {
        name: 'VZUS Ambwe',
        mint: new PublicKey('Dwf5wFNSuwtKC7xtvjGMpXPbRGqAf6WNmgKxXSNSqtaz'),
        role: ShipRole.BOUNTYHUNT,
    },
    [Pearce.X6]: {
        name: 'Pearce X6',
        mint: new PublicKey('B8XeKhrKTKQTPePk87u6tA4KFd8oHzu1VqvbAuaDvLNv'),
        role: ShipRole.FIGHTER,
    },
    [Pearce.R8]: {
        name: 'Pearce R8',
        mint: new PublicKey('9RGak4MwF9hH72ma42yuytDZsusEQQY57h9Ud9Zao1wY'),
        role: ShipRole.REFUELREPAIR,
    },
    [Pearce.C9]: {
        name: 'Pearce C9',
        mint: new PublicKey('G3NxTo8zMGMmDiADrWwpRdKz7Kbo2o5LgjCm4tKt2gxR'),
        role: ShipRole.FIGHTER,
    },
    [Ogrika.JodAsteris]: {
        name: 'Ogrika Jod Asteris',
        mint: new PublicKey('6dUPLNJ6M1oorUyoH4QvHAdTQp4kViVwCNLUvnS9EHyN'),
        role: ShipRole.TRANSPORT,
    },
    [FimbulECOS.TreeArrow]: {
        name: 'Fimbul ECOS Treearrow',
        mint: new PublicKey('rcm1idAXHDYtcjtm56Q1HgFfJ2fnH9rUzEQg1WC74Ar'),
        role: ShipRole.BOMBER,
    },
    [Rainbow.Chi]: {
        name: 'Rainbow Chi',
        mint: new PublicKey('Ag97kh8ZNQp9aEB4ETX9kDsXDnBzrjXQccH42xdRnWkP'),
        role: ShipRole.FIGHTER,
    },
    [FimbulBYOS.Earp]: {
        name: 'Fimbul BYOS Earp',
        mint: new PublicKey('Da6xRFv8W3JhQzmzYYACbxiADwdr3yDcwrBqo4WgjLBW'),
        role: ShipRole.FIGHTER,
    },
    [Calico.Evac]: {
        name: 'Calico Evac',
        mint: new PublicKey('yMr4mABoBhzV948WzFuVDZPMdzJe8uL42v3RE5cdFqm'),
        role: ShipRole.RESCUE,
    },
    [Fimbul.Airbike]: {
        name: 'Fimbul Airbike',
        mint: new PublicKey('6N7zoDykqkbf4354jhHb6oD7zxqv6BZNtE77MyX99CUQ'),
        role: ShipRole.RACER,
    },
    [Ogrika.Mik]: {
        name: 'Ogrika Mik',
        mint: new PublicKey('HLAKintjFoH6dSwVDVV2a99tUV2r6CVR7hpKpaWUB6PU'),
        role: ShipRole.FIGHTER,
    },
    [FimbulECOS.Unibomba]: {
        name: 'Fimbul ECOS Unibomba',
        mint: new PublicKey('5Uu2jCmS9mVBC7RyR9eMVDp79C9cocq6R31yCEYXt9zG'),
        role: ShipRole.BOMBER,
    },
    [Rainbow.Arc]: {
        name: 'Rainbow Arc',
        mint: new PublicKey('7BAvPzwjf6Y8hZpaweT4dobBT5nEy95HJJci3P6E3C8Y'),
        role: ShipRole.TRANSPORT,
    },
    [Fimbul.Lowbie]: {
        name: 'Fimbul Lowbie',
        mint: new PublicKey('68A55jmwJaiDULknycr7kRNi11XNyKSgotK6pVzJsSLe'),
        role: ShipRole.TRANSPORT,
    },
    [VZUS.Ballad]: {
        name: 'VZUS Ballad',
        mint: new PublicKey('9TTFMGM32UHvuoKnrFL5ECbG7vcYnwyhbT4gJAy56LNA'),
        role: ShipRole.FIGHTER,
    },
    [Busan.ThrillOfLife]: {
        name: 'Busan Thrill of Life',
        mint: new PublicKey('ETadnNjotJA759Dn3SYa2ZN9TB6NF6hndF6ciajZVA4Y'),
        role: ShipRole.FIGHTER,
    },
    [Opal.Bitboat]: {
        name: 'Opal Bitboat',
        mint: new PublicKey('Dni9ZeMpsUY825XvBdTLdjGLKCXuj2z1JYE769yrnu4L'),
        role: ShipRole.TRANSPORT,
    },
    [Calico.Medtech]: {
        name: 'Calico Medtech',
        mint: new PublicKey('EVyhcpWDbjEqUUadpv22WNxUx2z5kHwiYwoTvKiDhsVH'),
        role: ShipRole.RESCUE,
    },
    [Calico.AtsEnforcer]: {
        name: 'Calico ATS Enforcer',
        mint: new PublicKey('GAANgsxxkPMQ5rwP8qbXh3HifjFkBYM7MVciAsNBeL2S'),
        role: ShipRole.FIGHTER,
    },
    [Pearce.R6]: {
        name: 'Pearce R6',
        mint: new PublicKey('427BaYEFGERXin2fxuRFGyUDzMoZYA9KTr9w7jZqRKqk'),
        role: ShipRole.REPAIR,
    },
    [Busan.MaidenHeart]: {
        name: 'Busan Maiden Heart',
        mint: new PublicKey('BA4SZjCZoPzPJb9oa7W8eFJbYDpYtD54ZAKPxE3GTWXM'),
        role: ShipRole.FIGHTER,
    },
    [Ogrika.Tursik]: {
        name: 'Ogrika Tursic',
        mint: new PublicKey('EQYL2jczThWKRnydEExa4aYCKkXG7gAq3g8d7x85TQCR'),
        role: ShipRole.FIGHTER,
    },
    [Pearce.D9]: {
        name: 'Pearce D9',
        mint: new PublicKey('6sPspaPk1UJDRPAASWhnwc8sghToVXBZAXskmHZG8M5v'),
        role: ShipRole.SALVAGE,
    },
    [Pearce.T1]: {
        name: 'Pearce T1',
        mint: new PublicKey('HQayhtSnytPSTpb3LCJrxkECTDbxJZH1LKwPk9jRKRLf'),
        role: ShipRole.FIGHTER,
    },
    [Busan.TheLastStand]: {
        name: 'Busan The Last Stand mk. VIII',
        mint: new PublicKey('9tGU2Mvtvvr2n7Fjmw3zbsdr5YrfGbLtPxR31bi5hTA4'),
        role: ShipRole.FIGHTER,
    },
    [FimbulECOS.Superphoenix]: {
        name: 'Fimbul ECOS Superphoenix',
        mint: new PublicKey('BXtMBhvfeskw2YQAa4uB5WTBWZBhFn8imwQ24HHzjrPG'),
        role: ShipRole.BOMBER,
    },
    [Ogrika.Niruch]: {
        name: 'Ogrika Niruch',
        mint: new PublicKey('A94GocS3UK23zKVuwRqgcuyEbpuaNuWB5dK8fsiw6VJG'),
        role: ShipRole.TRANSPORT,
    },
    [Ogrika.Ruch]: {
        name: 'Ogrika Ruch',
        mint: new PublicKey('ruCHVupnE23CQzJ47STdKqLU2jVdFQ9FHEXj7Zvw8hJ'),
        role: ShipRole.RACER,
    },
    [Calico.Scud]: {
        name: 'Calico Scud',
        mint: new PublicKey('29uLEnHrLnuAJgrDsM66x4uhzwSi6w7bTsYjTGSf1KRk'),
        role: ShipRole.RACER,
    },
    [Calico.Maxhog]: {
        name: 'Calico Maxhog',
        mint: new PublicKey('6NeyGNP8tKX6V629kQNCa7Xxu8VKQRbGkMfy5477eKRs'),
        role: ShipRole.TRANSPORT,
    },
    [VZUS.Solos]: {
        name: 'VZUS Solos',
        mint: new PublicKey('DXRALgzwdJbKHatQLEyK59tq2sBTuvHPxmKamcrDnKSx'),
        role: ShipRole.RACER,
    },
    [Opal.RayFam]: {
        name: 'Opal Rayfam',
        mint: new PublicKey('6xS4TduL4hBsPS2ko21ynFqHf3BSAG5yq8MmV8sQoojU'),
        role: ShipRole.DATARUNNER,
    },
    [Fimbul.MambaEX]: {
        name: 'Fimbul Mamba EX',
        mint: new PublicKey('ErMXUtK3jiNMkxBh3Wd1pxXpNREdjp5w8LyofBp5PAvx'),
        role: ShipRole.BOUNTYHUNT,
    },
    [Fimbul.Sledbarge]: {
        name: 'Fimbul Sledbarge',
        mint: new PublicKey('SLEDCrZ1tA6H21ez1uhxmK1jVYCyzCvDAUEbJxGm9qe'),
        role: ShipRole.TRANSPORT,
    },
    [Armstrong.Tip]: {
        name: 'Armstrong IMP Tip',
        mint: new PublicKey('1MP1J8CN5d1roJjsktiUbcTmHAeDYakfQ7eSRDLYmbG'),
        role: ShipRole.MINER,
    },
    [Armstrong.Tap]: {
        name: 'Armstrong IMP Tap',
        mint: new PublicKey('1MP2S5WNNFzf1MRLacPdAf8TVoebNtuuEm15xWmnpa7'),
        role: ShipRole.MINER,
    },
    [Armstrong.IMP]: {
        name: 'Armstrong IMP',
        mint: new PublicKey('1MP3RpP21TVoEWVnvNuG1piq32AnWtsxzd2fykS8yJe'),
        role: ShipRole.MINER,
    },
    [Rainbow.Phi]: {
        name: 'Rainbow Phi',
        mint: new PublicKey('phi4PYgmxeTMLLpGkU87T16VUZ6AjWZESkfT1JGJ635'),
        role: ShipRole.FIGHTER,
    },
    [Calico.Shipit]: {
        name: 'Calico Shipit',
        mint: new PublicKey('SHiPitEZcCoyXEKqw9ovCdYeNzck9uVbb1KCcsHaGhc'),
        role: ShipRole.TRANSPORT,
    },
    [FimbulBYOS.Ranger]: {
        name: 'Fimbul BYOS Ranger',
        mint: new PublicKey('RNGRjeGyFeyFT4k5aTJXKZukVx3GbG215fcSQJxg64G'),
        role: ShipRole.DATARUNNER,
    },
    [Busan.Pulse]: {
        name: 'Busan Pulse',
        mint: new PublicKey('puLSevjndZbxLSynPQgGVh7oPCGimhqLppV5Kb8o3S8'),
        role: ShipRole.RACER,
    },
}
