import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('uuid')
  openid?: string;

  /**
   * Count as Megabytes.
   */
  @Column('double')
  size_megabytes?: number;

  @Column('timestamp')
  created_at?: Date;

  @Column('timestamp')
  uploaded_at?: Date;

  @Column()
  filename?: string;

  /**
   * Count as seconds.
   */
  @Column()
  storage_duration_seconds?: number;

  @Column('timestamp')
  expires_at?: Date;

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
