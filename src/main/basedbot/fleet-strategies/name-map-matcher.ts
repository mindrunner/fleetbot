import { Strategy } from '../fsm/strategy'

import { StrategyMap } from './strategy-config'

export const nameMapMatcher =
    (fallback: Strategy) =>
    (key: string, strategyMap: StrategyMap): Strategy => {
        return strategyMap.get(key) || fallback
    }
