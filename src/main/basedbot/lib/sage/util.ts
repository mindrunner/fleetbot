import { byteArrayToString } from '@staratlas/data-source'

export const getName = (item: any): string => {
    const data = item?.data?.name ?? item?.data?.fleetLabel

    return data ? byteArrayToString(data) : 'N/A'
}

// export const getFleetName = (fleet: Fleet): string => byteArrayToString(fleet.data.fleetLabel)
// export const getStarbaseName = (starbase: Starbase): string => byteArrayToString(starbase.data.name)
// export const getPlanetName = (planet: Planet): string => byteArrayToString(planet.data.name)
