import {
    BaseEntity,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
    RelationId,
    Unique,
} from 'typeorm'
import { Wallet } from './wallet.js'

@Entity()
@Unique(['signature', 'resource'])
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'text' })
    @Index()
    signature!: string

    @Column('timestamptz')
    time!: Date

    @Column({ type: 'float' })
    amount!: number

    @Column({ type: 'float' })
    originalAmount!: number

    @Column({ type: 'text' })
    resource!: string

    @RelationId((tx: Transaction) => tx.wallet)
    walletPublicKey!: string

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
        onDelete: 'CASCADE',
    })
    wallet!: Relation<Wallet>
}
