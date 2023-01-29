import Big from 'big.js'
import { BaseEntity, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

import { Refill } from './refill'
import { Transaction } from './transaction'

@Entity()
export class Wallet extends BaseEntity {
    @PrimaryColumn()
    publicKey: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @Index()
    nextRefill: Date

    @Column({ type: 'float', default: 0.15 })
    tip: number

    @Column({ nullable: true })
    nick?: string

    @Column({ default: false })
    authed: boolean

    @Column({ type: 'float', nullable: true })
    authTxAmount?: number | null

    @Column({ type: 'timestamptz', nullable: true })
    authExpire?: Date | null

    @Index()
    @Column({ type: 'bigint', nullable: true })
    telegramId?: number | null

    @Index()
    @Column({ default: true })
    enabled: boolean

    @Column({ default: true })
    notify: boolean

    @OneToMany(() => Transaction, transaction => transaction.wallet)
    transactions: Promise<Transaction[]>

    @OneToMany(() => Refill, refill => refill.wallet)
    refills: Promise<Refill[]>

    async getBalance (): Promise<Big> {
        const deposit = (await this.transactions).reduce((acc, cur) => acc.add(cur.amount), Big(0))
        const spent = (await this.refills).reduce((acc, cur) => acc.add(cur.price), Big(0))

        return deposit.minus(spent).minus(await this.totalTipped())
    }

    async totalTipped (): Promise<Big> {
        return (await this.refills).reduce((acc, cur) => acc.add(Big(cur.price).mul(cur.tip)), Big(0))
    }
}
