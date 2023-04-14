import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

import { RelationIdColumn } from '../columns'

import { Wallet } from './wallet'

@Entity()
export class Transaction extends BaseEntity {
    @PrimaryColumn()
    signature: string

    @Column('timestamptz')
    time: Date

    @Column({ type: 'float' })
    amount: number

    @Column({ type: 'float' })
    originalAmount: number

    @Column()
    resource: string

    @RelationIdColumn()
    walletPublicKey: Wallet['publicKey']

    @ManyToOne(() => Wallet, wallet => wallet.transactions, { onDelete: 'CASCADE' })
    wallet: Wallet
}
