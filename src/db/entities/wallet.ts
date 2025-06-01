import Big from 'big.js'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm'

import { Refill } from './refill.js'
import { RelationIdColumn } from '../columns/index.js'

@Entity()
export class Wallet extends BaseEntity {
    @PrimaryColumn({ type: 'text' })
    publicKey!: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @Index()
    nextRefill!: Date

    @Column({ type: 'float', default: 0.15 })
    tip!: number

    @Column({ type: 'text', nullable: true })
    nick?: string

    @Column({ type: 'boolean', default: false })
    authed!: boolean

    @Column({ type: 'float', nullable: true })
    authTxAmount?: number | null

    @Column({ type: 'timestamptz', nullable: true })
    authExpire?: Date | null

    @Index()
    @Column({ type: 'bigint', nullable: true })
    telegramId?: number | null

    @Index()
    @Column({ type: 'boolean', default: true })
    enabled!: boolean

    @Column({ type: 'boolean', default: true })
    notify!: boolean

    @OneToMany(() => Transaction, (transaction) => transaction.wallet)
    transactions!: Promise<Transaction[]>

    @OneToMany(() => Bonus, (bonus) => bonus.wallet)
    bonuses!: Promise<Bonus[]>

    @OneToMany(() => Refill, (refill) => refill.wallet)
    refills!: Promise<Refill[]>

    async getBalance(): Promise<Big> {
        const deposit = (await this.transactions).reduce(
            (acc, cur) => acc.add(cur.amount),
            Big(0),
        )
        const bonus = (await this.bonuses).reduce(
            (acc, cur) => acc.add(cur.amount),
            Big(0),
        )
        const spent = (await this.refills).reduce(
            (acc, cur) => acc.add(cur.price),
            Big(0),
        )

        return deposit
            .add(bonus)
            .minus(spent)
            .minus(await this.totalTipped())
    }

    async totalTipped(): Promise<Big> {
        return (await this.refills).reduce(
            (acc, cur) => acc.add(Big(cur.price).mul(cur.tip)),
            Big(0),
        )
    }
}

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

    @RelationIdColumn({ type: 'text' })
    walletPublicKey!: string

    @ManyToOne(() => Wallet, (wallet) => wallet.bonuses, {
        onDelete: 'CASCADE',
    })
    wallet!: Wallet
}

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

    @RelationIdColumn({ type: 'text' })
    walletPublicKey!: Wallet['publicKey']

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
        onDelete: 'CASCADE',
    })
    wallet!: Wallet
}
