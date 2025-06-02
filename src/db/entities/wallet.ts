import Big from 'big.js'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryColumn,
    type Relation,
    UpdateDateColumn,
} from 'typeorm'
import { Transaction } from './transaction.js'
import { Bonus } from './bonus.js'
import { Refill } from './refill.js'

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

    @OneToMany(() => Transaction, (tx) => tx.wallet, { lazy: true })
    transactions!: Relation<Promise<Transaction[]>>

    @OneToMany(() => Bonus, (b) => b.wallet, { lazy: true })
    bonuses!: Relation<Promise<Bonus[]>>

    @OneToMany(() => Refill, (r) => r.wallet, { lazy: true })
    refills!: Relation<Promise<Refill[]>>

    async getBalance(): Promise<Big> {
        const txs = await this.transactions
        console.log(this.publicKey)
        console.log(JSON.stringify(txs))

        const deposit = txs.reduce((acc, cur) => acc.add(cur.amount), Big(0))
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
