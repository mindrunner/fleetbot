import {
    BaseEntity,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm'

import { RelationIdColumn } from '../columns'

import { Wallet } from './wallet'

@Entity()
@Unique(['signature', 'resource'])
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    @Index()
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

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
        onDelete: 'CASCADE',
    })
    wallet: Wallet
}
