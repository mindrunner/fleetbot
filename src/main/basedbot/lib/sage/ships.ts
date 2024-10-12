import { PublicKey } from '@solana/web3.js'

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
}

export enum Rainbow {
    Chi = 'CHI',
    Om = 'OM',
    Arc = 'ARC',
}

export enum Calico {
    Evac = 'CALEV',
    Guardian = 'CALG',
    CompaktHero = 'CALCH',
    Medtech = 'CALMED',
    AtsEnforcer = 'CALATS',
    Scud = 'CALSCD',
    Maxhog = 'CALMAX',
}

export enum Tufa {
    Feist = 'TUFAFE',
}

export enum Busan {
    ThrillOfLife = 'THRILL',
    MaidenHeart = 'HEART',
    TheLastStand = 'STAND',
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
    mint: PublicKey
}

interface ShipMap {
    [key: string]: ShipData
}

export const ships: ShipMap = {
    [DevShip.Test]: {
        name: 'A Test Ship',
        mint: new PublicKey('testyj8KfG3VhmvyXALbQ9riiEG9UbWZ7xKQmkDwJDA'),
    },
    [Pearce.X4]: {
        name: 'Pearce X4',
        mint: new PublicKey('CWvsu7kmgCDhi1bWBqA9N4NKkhpDV6heTb5T3we54zrt'),
    },
    [Opal.JetJet]: {
        name: 'Opal Jetjet',
        mint: new PublicKey('5o635z1vCTUxQF5qVgsbSVB3EKMThGA1Y6giyrhTpLJj'),
    },
    [Rainbow.Om]: {
        name: 'Rainbow Om',
        mint: new PublicKey('7feVdv745gGxZYKb5JEe84EGCJ6nGyMYtPng2wQRfrdh'),
    },
    [Tufa.Feist]: {
        name: 'Tufa Feist',
        mint: new PublicKey('2K7rLcoTsx2pS5KV1LW6wmRdu7GKxUn9azx6iUXY87fS'),
    },
    [FimbulECOS.Greenader]: {
        name: 'Fimbul ECOS Greenader',
        mint: new PublicKey('2bkoL87tqVzgwGcRjqm5vk3RGjd5Mpay81dx88huU4e5'),
    },
    [FimbulECOS.Bombarella]: {
        name: 'Fimbul ECOS Bombarella',
        mint: new PublicKey('32K2GbxgmMWAvdztdY96NYD7eucpk95rbK2wVgh2vFRo'),
    },
    [FimbulBYOS.Tankship]: {
        name: 'Fimbul BYOS Tankship',
        mint: new PublicKey('7pW9NHhuHCP2rBhwE23B6v5bwrfmvGmgg1LgPSVpTxZv'),
    },
    [FimbulBYOS.Butch]: {
        name: 'Fimbul BYOS Butch',
        mint: new PublicKey('BBUPJXjgwBhHXrsQoLw4oCk2DrVR8sFYjCo7MjNjH2NE'),
    },
    [Fimbul.Mamba]: {
        name: 'Fimbul Mamba',
        mint: new PublicKey('En3uuAwxMFFKH382Xkr24LVKjs8e25NZXUV3FBkjnmuX'),
    },
    [Pearce.X5]: {
        name: 'Pearce X5',
        mint: new PublicKey('7CBrGuHSpRvLgQMwA2Vbe9ra9nsg2K9FUDH3TpMmjFdA'),
    },
    [Ogrika.Thripid]: {
        name: 'Ogrika Thripid',
        mint: new PublicKey('8Tt2ec8HKmwqr1wxKVwizmcvdJQos2B42faDyyinjFti'),
    },
    [Ogrika.Sunpaa]: {
        name: 'Ogrika Sunpaa',
        mint: new PublicKey('8mQpeQjw8zqxFDKV3iHdkec7DMh4uJD52kHESitKXs2f'),
    },
    [VZUS.Opod]: {
        name: 'VZUS Opod',
        mint: new PublicKey('4YRhx9VQR4TvscsAcvUjJZPjiT6vAjAQDrDo1pJR5RVF'),
    },
    [FimbulBYOS.Packlite]: {
        name: 'Fimbul BYOS Packlite',
        mint: new PublicKey('8BA19uTEFGPLHYHaGhJBd3y4rJtZgsA37HFDoPZ9wgzv'),
    },
    [Calico.Guardian]: {
        name: 'Calico Guardian',
        mint: new PublicKey('EyUcVag89Lx7rpJLZctPYwHiSJpk8TM411bqgpeKcS5n'),
    },
    [Calico.CompaktHero]: {
        name: 'Calico Compakt Hero',
        mint: new PublicKey('9jTjPB8rGNEBC5HzM49ZfqN1F8xQLUeuRVNeh3DFGHbh'),
    },
    [Opal.Jet]: {
        name: 'Opal Jet',
        mint: new PublicKey('5tyJwmNjzHusouZxsaMjSkLna9VeeJkg2FRaDXLRFQSk'),
    },
    [Pearce.C11]: {
        name: 'Pearce C11',
        mint: new PublicKey('6whMv9uPMG3mPXcCgDaqFg6TaN4KZM1m3BmjGJXJRvco'),
    },
    [Pearce.F4]: {
        name: 'Pearce F4',
        mint: new PublicKey('HUxaWGNGgZSEVpB2Epgx2zYHgi7KxP8atApkmdnsng2s'),
    },
    [VZUS.Ambwe]: {
        name: 'VZUS Ambwe',
        mint: new PublicKey('Dwf5wFNSuwtKC7xtvjGMpXPbRGqAf6WNmgKxXSNSqtaz'),
    },
    [Pearce.X6]: {
        name: 'Pearce X6',
        mint: new PublicKey('B8XeKhrKTKQTPePk87u6tA4KFd8oHzu1VqvbAuaDvLNv'),
    },
    [Pearce.R8]: {
        name: 'Pearce R8',
        mint: new PublicKey('9RGak4MwF9hH72ma42yuytDZsusEQQY57h9Ud9Zao1wY'),
    },
    [Pearce.C9]: {
        name: 'Pearce C9',
        mint: new PublicKey('G3NxTo8zMGMmDiADrWwpRdKz7Kbo2o5LgjCm4tKt2gxR'),
    },
    [Ogrika.JodAsteris]: {
        name: 'Ogrika Jod Asteris',
        mint: new PublicKey('6dUPLNJ6M1oorUyoH4QvHAdTQp4kViVwCNLUvnS9EHyN'),
    },
    [FimbulECOS.TreeArrow]: {
        name: 'Fimbul ECOS Treearrow',
        mint: new PublicKey('rcm1idAXHDYtcjtm56Q1HgFfJ2fnH9rUzEQg1WC74Ar'),
    },
    [Rainbow.Chi]: {
        name: 'Rainbow Chi',
        mint: new PublicKey('Ag97kh8ZNQp9aEB4ETX9kDsXDnBzrjXQccH42xdRnWkP'),
    },
    [FimbulBYOS.Earp]: {
        name: 'Fimbul BYOS Earp',
        mint: new PublicKey('Da6xRFv8W3JhQzmzYYACbxiADwdr3yDcwrBqo4WgjLBW'),
    },
    [Calico.Evac]: {
        name: 'Calico Evac',
        mint: new PublicKey('yMr4mABoBhzV948WzFuVDZPMdzJe8uL42v3RE5cdFqm'),
    },
    [Fimbul.Airbike]: {
        name: 'Fimbul Airbike',
        mint: new PublicKey('6N7zoDykqkbf4354jhHb6oD7zxqv6BZNtE77MyX99CUQ'),
    },
    [Ogrika.Mik]: {
        name: 'Ogrika Mik',
        mint: new PublicKey('HLAKintjFoH6dSwVDVV2a99tUV2r6CVR7hpKpaWUB6PU'),
    },
    [FimbulECOS.Unibomba]: {
        name: 'Fimbul ECOS Unibomba',
        mint: new PublicKey('5Uu2jCmS9mVBC7RyR9eMVDp79C9cocq6R31yCEYXt9zG'),
    },
    [Rainbow.Arc]: {
        name: 'Rainbow Arc',
        mint: new PublicKey('7BAvPzwjf6Y8hZpaweT4dobBT5nEy95HJJci3P6E3C8Y'),
    },
    [Fimbul.Lowbie]: {
        name: 'Fimbul Lowbie',
        mint: new PublicKey('68A55jmwJaiDULknycr7kRNi11XNyKSgotK6pVzJsSLe'),
    },
    [VZUS.Ballad]: {
        name: 'VZUS Ballad',
        mint: new PublicKey('9TTFMGM32UHvuoKnrFL5ECbG7vcYnwyhbT4gJAy56LNA'),
    },
    [Busan.ThrillOfLife]: {
        name: 'Busan Thrill of Life',
        mint: new PublicKey('ETadnNjotJA759Dn3SYa2ZN9TB6NF6hndF6ciajZVA4Y'),
    },
    [Opal.Bitboat]: {
        name: 'Opal Bitboat',
        mint: new PublicKey('Dni9ZeMpsUY825XvBdTLdjGLKCXuj2z1JYE769yrnu4L'),
    },
    [Calico.Medtech]: {
        name: 'Calico Medtech',
        mint: new PublicKey('EVyhcpWDbjEqUUadpv22WNxUx2z5kHwiYwoTvKiDhsVH'),
    },
    [Calico.AtsEnforcer]: {
        name: 'Calico ATS Enforcer',
        mint: new PublicKey('GAANgsxxkPMQ5rwP8qbXh3HifjFkBYM7MVciAsNBeL2S'),
    },
    [Pearce.R6]: {
        name: 'Pearce R6',
        mint: new PublicKey('427BaYEFGERXin2fxuRFGyUDzMoZYA9KTr9w7jZqRKqk'),
    },
    [Busan.MaidenHeart]: {
        name: 'Busan Maiden Heart',
        mint: new PublicKey('BA4SZjCZoPzPJb9oa7W8eFJbYDpYtD54ZAKPxE3GTWXM'),
    },
    [Ogrika.Tursik]: {
        name: 'Ogrika Tursic',
        mint: new PublicKey('EQYL2jczThWKRnydEExa4aYCKkXG7gAq3g8d7x85TQCR'),
    },
    [Pearce.D9]: {
        name: 'Pearce D9',
        mint: new PublicKey('6sPspaPk1UJDRPAASWhnwc8sghToVXBZAXskmHZG8M5v'),
    },
    [Pearce.T1]: {
        name: 'Pearce T1',
        mint: new PublicKey('HQayhtSnytPSTpb3LCJrxkECTDbxJZH1LKwPk9jRKRLf'),
    },
    [Busan.TheLastStand]: {
        name: 'Busan The Last Stand mk. VIII',
        mint: new PublicKey('9tGU2Mvtvvr2n7Fjmw3zbsdr5YrfGbLtPxR31bi5hTA4'),
    },
    [FimbulECOS.Superphoenix]: {
        name: 'Fimbul ECOS Superphoenix',
        mint: new PublicKey('BXtMBhvfeskw2YQAa4uB5WTBWZBhFn8imwQ24HHzjrPG'),
    },
    [Ogrika.Niruch]: {
        name: 'Ogrika Niruch',
        mint: new PublicKey('A94GocS3UK23zKVuwRqgcuyEbpuaNuWB5dK8fsiw6VJG'),
    },
    [Ogrika.Ruch]: {
        name: 'Ogrika Ruch',
        mint: new PublicKey('ruCHVupnE23CQzJ47STdKqLU2jVdFQ9FHEXj7Zvw8hJ'),
    },
    [Calico.Scud]: {
        name: 'Calico Scud',
        mint: new PublicKey('29uLEnHrLnuAJgrDsM66x4uhzwSi6w7bTsYjTGSf1KRk'),
    },
    [Calico.Maxhog]: {
        name: 'Calico Maxhog',
        mint: new PublicKey('6NeyGNP8tKX6V629kQNCa7Xxu8VKQRbGkMfy5477eKRs'),
    },
    [VZUS.Solos]: {
        name: 'VZUS Solos',
        mint: new PublicKey('DXRALgzwdJbKHatQLEyK59tq2sBTuvHPxmKamcrDnKSx'),
    },
    [Opal.RayFam]: {
        name: 'Opal Rayfam',
        mint: new PublicKey('6xS4TduL4hBsPS2ko21ynFqHf3BSAG5yq8MmV8sQoojU'),
    },
    [Fimbul.MambaEX]: {
        name: 'Fimbul Mamba EX',
        mint: new PublicKey('ErMXUtK3jiNMkxBh3Wd1pxXpNREdjp5w8LyofBp5PAvx'),
    },
    [Fimbul.Sledbarge]: {
        name: 'Fimbul Sledbarge',
        mint: new PublicKey('SLEDCrZ1tA6H21ez1uhxmK1jVYCyzCvDAUEbJxGm9qe'),
    },
    [Armstrong.Tip]: {
        name: 'Armstrong IMP Tip',
        mint: new PublicKey('1MP1J8CN5d1roJjsktiUbcTmHAeDYakfQ7eSRDLYmbG'),
    },
    [Armstrong.Tap]: {
        name: 'Armstrong IMP Tap',
        mint: new PublicKey('1MP2S5WNNFzf1MRLacPdAf8TVoebNtuuEm15xWmnpa7'),
    },
    [Armstrong.IMP]: {
        name: 'Armstrong IMP',
        mint: new PublicKey('1MP3RpP21TVoEWVnvNuG1piq32AnWtsxzd2fykS8yJe'),
    },
}
