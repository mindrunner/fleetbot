import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { RelationIdColumn } from '../columns'

import { Wallet } from './wallet'

@Entity()
export class Bonus extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('timestamptz')
    time: Date

    @Column({ type: 'float' })
    amount: number

    @Column()
    reason: string

    @RelationIdColumn()
    walletPublicKey: Wallet['publicKey']

    @ManyToOne(() => Wallet, wallet => wallet.transactions, { onDelete: 'CASCADE' })
    wallet: Wallet
}
