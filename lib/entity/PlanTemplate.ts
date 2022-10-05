import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlanTemplate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  plan_id?: string;

  @Column()
  datapoints?: number;

  @Column()
  name?: string;

  @Column()
  description?: string;
}
