import BN from 'bn.js'

import dayjs from '../../../../../dayjs'

export const transformTime = (time: BN): dayjs.Dayjs =>
    dayjs.unix(time.toNumber())
