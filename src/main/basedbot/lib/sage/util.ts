import { byteArrayToString } from '@staratlas/data-source'
import { Fleet, MineItem, Planet, Starbase } from '@staratlas/sage'

export const getName = (item: Fleet | Starbase | Planet | MineItem): string => {
    if (!item?.data) {
        return 'N/A'
    }

    const name = 'name' in item.data ? item.data.name : undefined
    const fleetLabel =
        'fleetLabel' in item.data ? item.data.fleetLabel : undefined

    const dataToConvert = name ?? fleetLabel

    return dataToConvert ? byteArrayToString(dataToConvert) : 'N/A'
}
