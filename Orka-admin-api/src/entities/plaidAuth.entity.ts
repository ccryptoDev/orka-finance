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
  
@Entity({ name: 'tblplaidauth' })
export class PlaidAuthEntity extends BaseEntity {
  @Column()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type:"uuid" })
  loan_id: string;

  @Column({ default: null })
  accountNumber: string;

  @Column({ default: null })
  routing: string;

  @Column({ default: null })
  wire_routing: string;

  @Column({
    type:'enum',
    enum: Flags,
    default: Flags.N
  })
  active_flag: Flags;

  @Column({
    type:'enum',
    enum: Flags,
    default: Flags.N
  })
  delete_flag: Flags;

  @Column({ type:"uuid", default: null })
  plaid_access_token_master_id: string;

  @Column({
    name: 'plaid_account_id',
    default: null,
    comment: 'Plaid\'s unique identifier for the account'
  })
  plaidAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
