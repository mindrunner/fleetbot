import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import duration from 'dayjs/plugin/duration.js'
import minMax from 'dayjs/plugin/minMax.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import utc from 'dayjs/plugin/utc.js'

export type { Dayjs } from 'dayjs'
export type { Duration } from 'dayjs/plugin/duration'

export const now = (): dayjs.Dayjs => dayjs()

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(duration)
dayjs.extend(minMax)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export default dayjs
