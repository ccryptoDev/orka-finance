import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Flags } from '../configs/config.enum';

@Entity({ name: 'tblanswer' })
export class Answer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'question_id',
  })
  questionId: string;

  @Column({
    type: 'uuid',
    default: null,
    name: 'loan_id',
  })
  loanId: string;

  @Column()
  answer: string;

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
