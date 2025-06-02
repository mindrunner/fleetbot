import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm'
import { RelationIdColumn } from '../columns/relation-id.js'
import { Wallet } from './wallet.js'

@Entity()
export class Bonus extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column('timestamptz')
    time!: Date

    @Column({ type: 'float' })
    amount!: number

    @Column({ type: 'varchar' })
    reason!: string

    @RelationIdColumn()
    walletPublicKey!: Wallet['publicKey']

    @ManyToOne(() => Wallet, (wallet) => wallet.bonuses, {
        onDelete: 'CASCADE',
    })
    wallet!: Relation<Wallet>
}
