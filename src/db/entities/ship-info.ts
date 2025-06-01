import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity()
export class ShipInfo extends BaseEntity {
    @PrimaryColumn({ type: 'string' })
    mint!: string

    @Column({ type: 'string' })
    name!: string

    @Column({ type: 'string' })
    imageName!: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date
}
