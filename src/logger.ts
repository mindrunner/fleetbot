import PrettyError from 'pretty-error'
import winston from 'winston'

import { config } from './config'

const prettyError = new PrettyError()
    .skipNodeFiles()
    .skip((traceLine: Record<string, unknown>): boolean => traceLine.packageName !== '[current]')
    .appendStyle({
        'pretty-error': {
            marginLeft: 0
        },
        'pretty-error > trace': {
            marginTop: 0
        },
        'pretty-error > trace > item': {
            bullet: '',
            marginBottom: 0
        }
    })

const prettyErrorFormat = winston.format((info) => {
    if (info.stack) {
        return {
            ...info,
            message: prettyError.render(info),
            stack: undefined
        }
    }

    return info
})

const format =
    winston.format.combine(
        winston.format.colorize(),
        winston.format.errors({ stack: true }),
        prettyErrorFormat(),
        winston.format.simple()
    )

export const logger = winston.createLogger({
    level: config.app?.logLevel || 'info',
    format,
    transports: [
        new winston.transports.Console()
    ]
})
