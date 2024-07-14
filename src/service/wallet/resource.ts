import { PublicKey } from '@solana/web3.js'

import { config } from '../../config'

export type Resource = PublicKey

export const resource = {
    atlas: new PublicKey(config.sol.atlasMint),
    food: new PublicKey(config.sol.foodMint),
    fuel: new PublicKey(config.sol.fuelMint),
    ammo: new PublicKey(config.sol.ammoMint),
    tool: new PublicKey(config.sol.toolMint),
}
