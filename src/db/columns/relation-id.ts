import { Column, ColumnOptions } from 'typeorm'

export const RelationIdColumn = (options: ColumnOptions = {}): ReturnType<typeof Column> => Column(options)
