import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import minMax from 'dayjs/plugin/minMax'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

export { Dayjs } from 'dayjs'
export { Duration } from 'dayjs/plugin/duration'

export const now = (): dayjs.Dayjs => dayjs()

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(duration)
dayjs.extend(minMax)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export default dayjs
