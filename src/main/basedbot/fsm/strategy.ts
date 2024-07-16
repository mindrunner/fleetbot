import { FleetInfo } from '../lib/sage/state/user-fleets'

export type Strategy = {
    send: (fleetInfo: FleetInfo) => Promise<void>
}
