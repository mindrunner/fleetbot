import { Coordinates } from './coordinates'

export enum Faction {
    MUD = 1,
    ONI = 2,
    UST = 3,
}

export interface SectorInfo {
    name: string
    closestFaction: Faction
    coordinates: Coordinates
}

export const galaxySectorsData = (): SectorInfo[] => {
    return [
        {
            name: 'MUD CSS',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(0, -39),
        },
        {
            name: 'MUD-2',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(2, -34),
        },
        {
            name: 'MUD-3',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(10, -41),
        },
        {
            name: 'MUD-4',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-2, -44),
        },
        {
            name: 'MUD-5',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-10, -37),
        },
        {
            name: 'ONI CSS',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-40, 30),
        },
        {
            name: 'ONI-2',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-42, 35),
        },
        {
            name: 'ONI-3',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-30, 30),
        },
        {
            name: 'ONI-4',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-38, 25),
        },
        {
            name: 'ONI-5',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-47, 30),
        },
        {
            name: 'Ustur CSS',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(40, 30),
        },
        {
            name: 'UST-2',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(42, 35),
        },
        {
            name: 'UST-3',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(48, 32),
        },
        {
            name: 'UST-4',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(38, 25),
        },
        {
            name: 'UST-5',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(30, 28),
        },
        {
            name: 'MRZ-1',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-15, -33),
        },
        {
            name: 'MRZ-2',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(12, -31),
        },
        {
            name: 'MRZ-3',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-22, -25),
        },
        {
            name: 'MRZ-4',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-8, -24),
        },
        {
            name: 'MRZ-5',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(2, -23),
        },
        {
            name: 'MRZ-6',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(11, -16),
        },
        {
            name: 'MRZ-7',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(21, -26),
        },
        {
            name: 'MRZ-8',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-30, -16),
        },
        {
            name: 'MRZ-9',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-14, -16),
        },
        {
            name: 'MRZ-10',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(23, -12),
        },
        {
            name: 'MRZ-11',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(31, -19),
        },
        {
            name: 'MRZ-12',
            closestFaction: Faction.MUD,
            coordinates: Coordinates.fromNumber(-16, 0),
        },
        {
            name: 'MRZ-13',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-36, -7),
        },
        {
            name: 'MRZ-14',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-23, 4),
        },
        {
            name: 'MRZ-15',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(22, 5),
        },
        {
            name: 'MRZ-16',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(39, -1),
        },
        {
            name: 'MRZ-17',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(16, -5),
        },
        {
            name: 'MRZ-18',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-40, 3),
        },
        {
            name: 'MRZ-19',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-35, 12),
        },
        {
            name: 'MRZ-20',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-25, 15),
        },
        {
            name: 'MRZ-21',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(25, 14),
        },
        {
            name: 'MRZ-22',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(35, 16),
        },
        {
            name: 'MRZ-23',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(44, 10),
        },
        {
            name: 'MRZ-24',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-45, 15),
        },
        {
            name: 'MRZ-25',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-18, 23),
        },
        {
            name: 'MRZ-26',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-9, 24),
        },
        {
            name: 'MRZ-27',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(2, 26),
        },
        {
            name: 'MRZ-28',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(17, 21),
        },
        {
            name: 'MRZ-29',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-22, 32),
        },
        {
            name: 'MRZ-30',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-19, 40),
        },
        {
            name: 'MRZ-31',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(-8, 35),
        },
        {
            name: 'MRZ-32',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(5, 44),
        },
        {
            name: 'MRZ-33',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(13, 37),
        },
        {
            name: 'MRZ-34',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(22, 31),
        },
        {
            name: 'MRZ-35',
            closestFaction: Faction.UST,
            coordinates: Coordinates.fromNumber(49, 20),
        },
        {
            name: 'MRZ-36',
            closestFaction: Faction.ONI,
            coordinates: Coordinates.fromNumber(0, 16),
        },
    ]
}
