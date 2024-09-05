import { Strategy } from '../fsm/strategy'

export type StrategyMap = Map<string, Strategy>
export const makeStrategyMap = (): StrategyMap => new Map<string, Strategy>()
export type MapMatcher = (key: string, mao: StrategyMap) => Strategy

export type StrategyConfig = {
    map: StrategyMap
    match: MapMatcher
}
