import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
    
  } from 'typeorm';

export enum StatusFlags {
	PAID = "PAID",
  CANCELLED = "CANCELLED"
};

  
@Entity({ name: 'tblpaymentmanagement' })
export class PaymentManagement extends BaseEntity {
@PrimaryGeneratedColumn()
ref_no: number;

@Column()
@Generated("uuid")
id: string;

@Column({type:"uuid", default:null})
loan_id: string;

@Column({type:"float"})
fundedAmount: number;

@Column({type:"float"})
fundedPercentage: number;

@Column({type:"float"})
balance: number;

@Column({type:"float", default:null})
processingFee: number;

@Column({
    type:'enum',
    enum: StatusFlags,
    default: StatusFlags.PAID,
})
status: StatusFlags;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}

