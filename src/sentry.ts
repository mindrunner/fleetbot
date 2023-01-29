import { ExtraErrorData, RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    release: process.env.APP_VERSION,
    environment: process.env.APP_ENVIRONMENT,
    normalizeDepth: 10,
    integrations (integrations) {
        return integrations
            .concat(new ExtraErrorData())
            .concat(new RewriteFrames({ root: process.cwd() }))
    }
})

export { Sentry }
