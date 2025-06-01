import { Context } from 'telegraf'
import { Update } from 'telegraf/types'

import { Wallet } from '../../db/entities/index.js'

export interface ContextMessageUpdate extends Context<Update> {
    user: Wallet | null
    authed: boolean
    params: string[]
}
