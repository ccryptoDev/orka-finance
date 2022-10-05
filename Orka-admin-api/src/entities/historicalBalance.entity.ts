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

  
@Entity({ name: 'tblhistoricalbalance' })
export class HistoricalBalanceEntity extends BaseEntity {
@Column()
@PrimaryGeneratedColumn("uuid")
id: string;

@Column({type:"uuid"})
bankAccountId: string;

@Column({type: "float"})
amount: number;

@Column({default:null})
date:Date;

@Column({default:null})
currency:string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}

