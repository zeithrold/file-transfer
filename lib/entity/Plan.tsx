import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('uuid')
  openid?: string

  @Column()
  plan_id?: string

  @Column('timestamp with local time zone')
  expire_at?: Date
}
