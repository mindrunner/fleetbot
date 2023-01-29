import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class ShipInfo extends BaseEntity {
    @PrimaryColumn()
    mint: string

    @Column()
    name: string

    @Column()
    imageName: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
}
