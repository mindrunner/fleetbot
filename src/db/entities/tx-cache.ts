import type { ParsedTransactionWithMeta } from '@solana/web3.js'
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class TxCache extends BaseEntity {
    @PrimaryColumn({ type: 'string' })
    id!: string

    @Column('jsonb', { nullable: false })
    tx!: ParsedTransactionWithMeta
}
