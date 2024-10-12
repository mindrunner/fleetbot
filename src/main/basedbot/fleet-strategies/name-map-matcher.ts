import { Strategy } from '../fsm/strategy'

import { FleetStrategy, StrategyMap } from './strategy-config'

export const nameMapMatcher =
    (fallback: Strategy) =>
    (key: string, strategyMap: StrategyMap): FleetStrategy => {
        return (
            strategyMap.get(key) || {
                strategy: fallback,
                fleet: null,
            }
        )
    }
