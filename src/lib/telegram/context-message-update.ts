import { Context } from 'telegraf'
import { Update } from 'telegraf/types'
import { Wallet } from '../../db/entities/wallet'

export interface ContextMessageUpdate extends Context<Update> {
    user: Wallet | null
    authed: boolean
    params: string[]
}
