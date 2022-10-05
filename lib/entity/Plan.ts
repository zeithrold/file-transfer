import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('uuid')
  openid?: string;

  @Column()
  plan_id?: string;
  
  @Column('timestamp')
  expire_at?: Date;
}
