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
export enum ReportType {
  Consumer = 'equifax-consumer',
  Commercial = 'equifax-comercial-set2'
}

@Entity({ name: 'tblcreditreport' })
export class Creditreport extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type:"uuid",default:null})
    loan_id: string;
    
    @Column()
    report: string;

    @Column({default:null})
    reportType: string;

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

