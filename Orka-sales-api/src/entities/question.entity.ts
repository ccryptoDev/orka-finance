import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Flags, Type, Condition } from '../configs/config.enum';

@Entity({ name: 'tblquestion' })
export class Questions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'delete_flag',
  })
  deleteFlag: Flags;

  @Column({
    type: 'enum',
    enum: Type,
    default: Type.Yes_or_no,
  })
  type: Type;

  @Column({
    type: 'enum',
    enum: Condition,
    default: Condition.eq,
  })
  condition: Condition;

  @Column({ default: 'yes' })
  approvedif: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
