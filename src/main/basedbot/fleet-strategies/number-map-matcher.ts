import { Strategy } from '../fsm/strategy'

import { FleetStrategy, StrategyMap } from './strategy-config'

export const numberMapMatcher =
    (fallback: Strategy) =>
    (key: string, strategyMap: StrategyMap): FleetStrategy => {
        const fallbackFleetStrategy = {
            strategy: fallback,
            fleet: null,
        }
        const extractNumbers = (str: string): Array<number> | undefined =>
            str.match(/\d+/g)?.map(Number)
        const [index] = extractNumbers(key) ?? []
        const mapKey = Array.from(strategyMap.keys()).find(extractNumbers)

        if (!index || !mapKey) return fallbackFleetStrategy

        return strategyMap.get(mapKey) || fallbackFleetStrategy
    }
