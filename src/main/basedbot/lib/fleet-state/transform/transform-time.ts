import BN from 'bn.js'

import dayjs from '../../../../../dayjs.js'

export const transformTime = (time: BN): dayjs.Dayjs =>
    dayjs.unix(time.toNumber())
