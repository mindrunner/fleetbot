import { FleetInfo } from '../lib/sage/state/user-fleets.js'

export type Strategy = {
    apply: (fleetInfo: FleetInfo) => Promise<void>
}

export const noop = (): Promise<void> => Promise.resolve()
