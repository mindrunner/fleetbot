import { Telegraf } from 'telegraf'

import { config } from '../../../config'
import { ContextMessageUpdate } from '../context-message-update'

export const help = (bot: Telegraf<ContextMessageUpdate>): void => {
    bot.command(['start', 'help'], async (ctx: ContextMessageUpdate) => {
        await ctx.persistentChatAction('typing', async () => {
            await ctx.replyWithHTML(`
<b>Welcome to fleetbot!</b>
I can automatically refill your Star Atlas enlisted fleets.

Prerequisites:
- Your wallet has enlisted Ships to the Faction Fleet. You can do that on <a>https://play.staratlas.com</a>
- You have refilled your ships at least once. This creates escrow accounts for the supplies. Unfortunately, I cannot do that for you.

Last but not least, you have to send me some <b>ATLAS</b> which I will use as your credits for the supplies.

You can send it to one of the following addresses:
- <b>${config.user.address1}</b>
- <b>${config.user.address2}</b>

As soon as I receive the ATLAS, I will start refilling your ships in regular intervals. I use an optimized refilling strategy, so that you are always covered.
However, to save you on commission, I will not fully load the ship. You can always refill your fleet by yourself. I will only jump in if you are running low.

Since it is now possible to stake your claim stakes and generate R4, I decided to accept this as a payment method as well. Please first set everything up
by using ATLAS as explained above. As soon as everything is set, you can also send me your R4 (tool, fuel, ammo, food). I am not keeping track of individual R4 account balances.
Instead, each R4 you send me will credit your internal ATLAS balance by the current market price.

Withdrawals are only possible in ATLAS.

For the hard work of refilling all the fleets, I keep 15% of the ATLAS I spend for myself.
You can change the commission at any time to any value.

Bare in mind that I check the ledger in 10 minute intervals. So your deposits will be recognized by me a little bit delayed. Dont' panic. :)
If something does not work as expected, you can always use the /support command to get a human fixing the issues.

Commands:

<b>/help</b> <i>Prints this message</i>
<b>/support</b> <i>Talk to a human</i>
<b>/verify <i>{publicKey}</i></b> <i>Connect your Telegram Account to a wallet</i>

Commands for verified users:

<b>/enable</b> <i>Enable automatic fleet refilling</i>
<b>/disable</b> <i>Disable automatic fleet refilling</i>
<b>/refill</b> <i>Trigger an immediate refill</i>
<b>/stats</b> <i>Query some stats</i>
<b>/transactions</b> <i>Query transactions associated to your wallet</i>
<b>/refills</b> <i>Query refill activity</i>
<b>/withdraw <i>{amount}</i></b> <i>Withdraw ATLAS back to your wallet</i>
<b>/logout</b> <i>Disconnects Telegram Account from wallet</i>
<b>/tip</b> <i>Set or query tip setting (default 15%)</i>
        `)
        })
    })
}
