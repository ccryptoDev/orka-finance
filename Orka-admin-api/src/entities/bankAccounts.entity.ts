import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y'
}
  
@Entity({ name: 'tblbankaccounts' })
export class BankAccounts extends BaseEntity {
  @Column()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type:"uuid" })
  loan_id: string;

  @Column({ type: "uuid", default: null })
  plaid_access_token_master_id: string;

  @Column()
  headername: string;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  type: string;

  @Column({ default: null })
  subtype: string;

  @Column({ default: null })
  acno: string;

  @Column({ default: null })
  routing: string;

  @Column({ default: null })
  wire_routing: string;

  @Column({ default: null })
  institution_id: string;

  @Column({ type: "float", default: null })
  available: number;

  @Column({ type: "float" })
  current: number;

  @Column({
    name: 'plaid_account_id',
    default: null,
    comment: 'Plaid\'s unique identifier for the account'
  })
  plaidAccountId: string;

  @Column({
    type:'enum',
    enum: Flags,
    default: Flags.N
  })
  delete_flag: Flags;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
