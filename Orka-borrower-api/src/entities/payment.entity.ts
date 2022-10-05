import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
    
  } from 'typeorm';

export enum TypeFlags {
	MANUAL = "MANUAL",
	AUTOMATIC = "AUTOMATIC",
};

export enum StatusFlags {
	AUTH = "AUTH",
	PENDING = "PENDING",
	DECLINED = "DECLINED",
	RETURNED = "RETURNED",
	SETTLING = "SETTLING",
	PAID = "PAID",
	SCRUBBED = "SCRUBBED",
	WAITING = "READY"
};

  
@Entity({ name: 'tblpayment' })
export class Payment extends BaseEntity {
@PrimaryGeneratedColumn()
ref_no: number;

@Column()
@Generated("uuid")
id: string;

@Column({type:"uuid", default:null})
loan_id: string;

@Column({type:"uuid", default:null})
user_id: string;

@Column({type:"float"})
unpaidPrincipal: number;

@Column({type:"float"})
principal: number;

@Column({type:"float"})
interest: number;

@Column({type:"float"})
fees: number;

@Column({type:"float"})
amount: number;

@Column({type:"uuid", default:null})
account: string;

@Column({
    type:'enum',
    enum: StatusFlags,
    default: StatusFlags.PENDING,
  })
status_flag: StatusFlags;

@Column({type:"date"})
nextPaymentSchedule: string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}

