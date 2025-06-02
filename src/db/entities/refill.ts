import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
    type Relation,
} from 'typeorm'
import { RelationIdColumn } from '../columns/relation-id.js'
import { Wallet } from './wallet.js'

@Entity()
export class Refill extends BaseEntity {
    @PrimaryColumn({ type: 'varchar' })
    signature!: string

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    time!: Date

    @Column({ type: 'varchar' })
    fleet!: string

    @Column({ type: 'float' })
    price!: number

    @Column({ type: 'float', default: 0.0 })
    preBalance!: number

    @Column({ type: 'float', default: 0.0 })
    postBalance!: number

    @Column({ type: 'float', default: 0.15 })
    tip!: number

    @Column({ type: 'integer' })
    food!: number

    @Column({ type: 'integer' })
    tool!: number

    @Column({ type: 'integer' })
    fuel!: number

    @Column({ type: 'integer' })
    ammo!: number

    @RelationIdColumn()
    walletPublicKey!: Wallet['publicKey']

    @ManyToOne(() => Wallet, (wallet) => wallet.refills, {
        onDelete: 'CASCADE',
    })
    wallet!: Relation<Wallet>
}
