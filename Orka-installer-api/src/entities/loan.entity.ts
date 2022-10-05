import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

import { Flags, PaymentScheduleStatusFlags, PhaseFlag } from '../configs/config.enum';

@Entity({ name: 'tblloan' })
export class Loan extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'ref_no' })
  refNo: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column({
    type: 'uuid',
    default: null,
    name: 'user_id'
  })
  user_id: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'delete_flag'
  })
  delete_lag: Flags;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'active_flag'
  })
  active_flag: Flags;

  @Column({
    type: 'enum',
    enum: PaymentScheduleStatusFlags,
    default: PaymentScheduleStatusFlags.waiting,
    name: 'status_flag'
  })
  statusFlag: PaymentScheduleStatusFlags;

  @Column({
    type: 'enum',
    enum: PhaseFlag,
    default: PhaseFlag.new,
    name: 'phase_flag'
  })
  phaseFlag: PhaseFlag;

  @Column({ default: null })
  salesRep: string

  @Column({
    type: 'uuid',
    default: null
  })
  salesRepId: string

  @Column({
    type: 'uuid',
    default: null,
    name: 'ins_user_id',
  })
  insUserId: string;

  @Column({ default: null })
  productId: string;

  @Column({ default: null })
  financingRequested: string;

  @Column({ default: null })
  financingTermRequested: string;

  @Column({ default: null })
  interestRate: string;

  @Column({ default: null })
  apr: string;

  @Column({ default: null })
  originationFee: string;

  @Column({ default: null })
  paymentAmount: string;

  @Column({ default: null })
  annualIncomeModeled: string;

  @Column({ default: null })
  nonOrkaDebt: string;

  @Column({ default: null })
  minMonthlyAverageBankBalance: string;

  @Column({ default: null })
  certifyUseofLoan: string;

  @Column({ default: null })
  incomeVerified: string;

  @Column({ default: null })
  incomeVerifiedAmount: string;

  @Column({ default: null })
  ownershipConfirmed: string;

  @Column({ default: null })
  taxDocumentsVerified: string;

  @Column({
    name: 'selected_bank_account_id',
    default: null,
    comment: 'Either the tblbankaccounts ID or the tbluserbankaccount ID'
  })
  selectedBankAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: null })
  requestedInformations:string;
}