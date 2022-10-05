import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated
  
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y'
}

@Entity({ name: 'tbluserbankaccount' })
export class UserBankAccount extends BaseEntity{
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type:"uuid", default:null})
  user_id: string;

  @Column()
  bankName: string;

  @Column()
  holderName: string;

  @Column()
  routingNumber: number;

  @Column({type:"bigint"})
  accountNumber: number;

  @Column({
      type:'enum',
      enum: Flags,
      default: Flags.N,
  })
  active_flag: Flags;

  @Column({
      type:'enum',
      enum: Flags,
      default: Flags.N,
  })
  delete_flag: Flags;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}