import { PublicKey } from '@solana/web3.js'
import { Game, Ship } from '@staratlas/sage'
import superagent from 'superagent'
import { config } from '../../../../config/index.js'
import { logger } from '../../../../logger.js'
import { programs } from '../programs.js'
import { getShipByMint } from './state/starbase-player.js'

interface ApiItem {
    _id: string
    attributes: {
        itemType: string
        category: string
        class?: string
        tier?: number
        rarity?: string
        spec?: string
        make?: string
        model?: string
    }
    name: string
    mint: string
}

interface ShipData {
    role: ShipRole
    mint: PublicKey
    make: ShipMake
    model: ShipModel
}

export interface ExtShipData extends ShipData {
    ship: Ship
    size: number
}

type ShipRole =
    | 'fighter'
    | 'multi-role'
    | 'racer'
    | 'miner'
    | 'freighter'
    | 'bomber'
    | 'support'
    | 'transport'

export type ShipMake =
    | 'Calico'
    | 'Pearce'
    | 'Fimbul'
    | 'Fimbul BYOS'
    | 'Fimbul ECOS'
    | 'Tufa'
    | 'Rainbow'
    | 'Armstrong Industries'
    | 'Opal'
    | 'VZUS'
    | 'Busan'
    | 'Ogrika'

type ShipModel =
    | 'T1'
    | 'Scud'
    | 'Feist'
    | 'Guardian'
    | 'Tankship'
    | 'X5'
    | 'Packlite'
    | 'Ogrika Thripid'
    | 'Ecos Unibomba'
    | 'Ballad'
    | 'Grenader'
    | 'Maud'
    | 'Bomba'
    | 'Earp'
    | 'Rainbow Arc'
    | 'Visus Ambwe'
    | 'Busan'
    | 'MiG'
    | 'Tree Arrow'

const problematicMints = new Set([
    'RNGRjeGyFeyFT4k5aTJXKZukVx3GbG215fcSQJxg64G',
    'phi4PYgmxeTMLLpGkU87T16VUZ6AjWZESkfT1JGJ635',
    'SHiPitEZcCoyXEKqw9ovCdYeNzck9uVbb1KCcsHaGhc',
])

const parseShips = (items: ApiItem[]): ShipData[] => {
    return items
        .filter((item) => item.attributes.itemType === 'ship')
        .filter((item) => !problematicMints.has(item.mint))
        .map((item) => ({
            name: item.name,
            role: item.attributes.spec as ShipRole,
            mint: new PublicKey(item.mint),
            make: item.attributes.make as ShipMake,
            model: (item.attributes.model as ShipModel) || 'Unknown',
        }))
}

export const fetchGalaxyData = async (baseUrl: string) => {
    logger.info('Fetching galaxy data')

    const res = await superagent.get(`${baseUrl}/items`)

    logger.info(`Fetched galaxy data: ${res.statusCode}`)
    return res.body
}

export const getShipData = async (game: Game): Promise<Array<ExtShipData>> => {
    const shipData = parseShips(await fetchGalaxyData(config.app.airdropUrl))
    return (
        await Promise.all(
            shipData.map(async (value): Promise<ExtShipData> => {
                const ship = await getShipByMint(value.mint, game, programs)
                const size = ship.data.sizeClass ** 2
                return {
                    make: value.make,
                    model: value.model,
                    role: value.role,
                    mint: value.mint,
                    ship: ship,
                    size,
                }
            }),
        )
    ).sort((a, b) => a.mint.toBase58().localeCompare(b.mint.toBase58()))
}
