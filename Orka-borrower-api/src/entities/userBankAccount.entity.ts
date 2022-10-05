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

@Entity({ name: 'tbluserbankaccount' })
export class UserBankAccount extends BaseEntity{
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'uuid' })
  loanId: string;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  bankCity: string;

  @Column({ nullable: true })
  bankState: string;

  @Column({ nullable: true })
  bankZipCode: string;

  @Column()
  holderName: string;

  @Column()
  routingNumber: string;

  @Column()
  accountNumber: string;

  @Column()
  accountType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
