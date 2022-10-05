import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Flags } from '../configs/config.enum';

@Entity({ name: 'tblfiles' })
export class FilesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'link_id',
  })
  linkId: string;

  @Column()
  services: string;

  @Column()
  originalname: string;

  @Column()
  filename: string;

  @Column({ default: null })
  documentType: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'delete_flag',
  })
  deleteFlag: Flags;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
