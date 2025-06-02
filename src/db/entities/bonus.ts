import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
    RelationId,
} from 'typeorm'
import { Wallet } from './wallet.js'

@Entity()
export class Bonus extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column('timestamptz')
    time!: Date

    @Column({ type: 'float' })
    amount!: number

    @Column({ type: 'text' })
    reason!: string

    @RelationId((bonus: Bonus) => bonus.wallet)
    walletPublicKey!: string

    @ManyToOne(() => Wallet, (wallet) => wallet.bonuses, {
        onDelete: 'CASCADE',
    })
    wallet!: Relation<Wallet>
}
