import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { PaymentScheduleStatusFlags } from '../configs/config.enum';

@Entity({ name: 'tblpaymentschedule' })
export class PaymentSchedule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    default: null,
    name: 'loan_id',
  })
  loanId: string;

  @Column({ type: 'float' })
  unpaidPrincipal: number;

  @Column({ type: 'float' })
  principal: number;

  @Column({ type: 'float' })
  interest: number;

  @Column({ type: 'float' })
  fees: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'date' })
  scheduleDate: string;

  @Column({
    type: 'enum',
    enum: PaymentScheduleStatusFlags,
    default: PaymentScheduleStatusFlags.UNPAID,
    name: 'status_flag',
  })
  statusFlag: PaymentScheduleStatusFlags;

  @Column({ type: 'date', default: null })
  paidAt: string;

  @Column({ type: 'uuid', default: null })
  bankAccount: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
