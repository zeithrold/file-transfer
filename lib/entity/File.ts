import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  openid?: string;

  /**
   * Count as Megabytes.
   */
  @Column()
  size_megabytes?: number;

  @Column('date')
  created_at?: Date;

  @Column('date')
  uploaded_at?: Date;

  @Column()
  filename?: string;

  /**
   * Count as seconds.
   */
  @Column()
  storage_duration_seconds?: number;

  @Column()
  hash?: string;

  @Column()
  file_uuid?: string;

  @Column()
  status?: 'active' | 'deleted' | 'inactive';

  @Column({
    length: 16,
  })
  code?: string;
}
