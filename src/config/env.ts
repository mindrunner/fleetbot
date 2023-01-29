import dotenv from 'dotenv'

import { Sentry } from '../sentry'

dotenv.config()
export const get = (key: string): string => {
    const value = process.env[key]

    if (!value) {
        const error = new Error(`Missing ${key} environment variable`)

        Sentry.captureException(error)

        throw error
    }

    return value || ''
}
