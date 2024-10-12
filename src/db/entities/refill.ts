import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

import { RelationIdColumn } from '../columns'

import { Wallet } from './wallet'

@Entity()
export class Refill extends BaseEntity {
    @PrimaryColumn()
    signature: string

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    time: Date

    @Column()
    fleet: string

    @Column({ type: 'float' })
    price: number

    @Column({ type: 'float', default: 0.0 })
    preBalance: number

    @Column({ type: 'float', default: 0.0 })
    postBalance: number

    @Column({ type: 'float', default: 0.15 })
    tip: number

    @Column()
    food: number

    @Column()
    tool: number

    @Column()
    fuel: number

    @Column()
    ammo: number

    @RelationIdColumn()
    walletPublicKey: Wallet['publicKey']

    @ManyToOne(() => Wallet, (wallet) => wallet.refills, {
        onDelete: 'CASCADE',
    })
    wallet: Wallet
}
