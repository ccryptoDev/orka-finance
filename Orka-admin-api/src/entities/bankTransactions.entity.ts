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

  
@Entity({ name: 'tblbanktransactions' })
export class BankTransactions extends BaseEntity {
@Column()
@PrimaryGeneratedColumn("uuid")
id: string;

@Column({type:"uuid"})
bankAccountId: string;

@Column({type: "float"})
amount: number;

@Column()
category: string;

@Column()
category_id: string;

@Column()
date: string;

@Column()
name: string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}

