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

export interface ComplyAdvantageReportPayload {
  code: number;
  status: string;
  content: {
    data: {
      hits: {
        doc: {
          sources: string[];
          types: string[];
        };
      }[];
    };
  };
}

@Entity({ name: 'tblcomplyadvantage' })
export class ComplyAdvantageReport extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type:"uuid",default:null})
    loan_id: string;
    
    @Column({default:null})
    report: string;
    
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

