import { Strategy } from '../fsm/strategy.js'

import { FleetStrategy, StrategyMap } from './strategy-config.js'

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
