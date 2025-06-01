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
    @PrimaryColumn({ type: 'varchar' })
    mint!: string

    @Column({ type: 'varchar' })
    name!: string

    @Column({ type: 'varchar' })
    imageName!: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date
}
