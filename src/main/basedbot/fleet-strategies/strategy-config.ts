import { Strategy } from '../fsm/strategy'
import { FleetShips } from '../lib/sage/act/create-fleet'

export type FleetStrategy = {
    fleet: FleetShips | null
    strategy: Strategy
}
export type StrategyMap = Map<string, FleetStrategy>
export const makeStrategyMap = (): StrategyMap =>
    new Map<string, FleetStrategy>()
export type MapMatcher = (key: string, map: StrategyMap) => FleetStrategy

export type StrategyConfig = {
    map: StrategyMap
    match: MapMatcher
}
