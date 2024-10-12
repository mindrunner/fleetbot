import { ParsedTransactionWithMeta } from '@solana/web3.js'
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class TxCache extends BaseEntity {
    @PrimaryColumn()
    id: string

    @Column('jsonb', { nullable: false })
    tx: ParsedTransactionWithMeta
}
