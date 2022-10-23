import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('uuid')
  openid?: string;

  @Column()
  plan_id?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  expire_at?: Date;
}
