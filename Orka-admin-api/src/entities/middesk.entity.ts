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
export interface MiddeskReportPayload {
  id: string;
  status: MiddeskReportStatuses;
  review: {
    tasks: {
      category: string;
      key: string;
      message: string;
      name: string;
      status: MiddeskReportTasksStatuses;
      sub_label: string;
      sources: {
        id: string;
        type: string;
        metadata: any;
      }[];
    }[];
  };
}
enum MiddeskReportStatuses {
  Open = 'open',
  Pending = 'pending',
  InAudit = 'in_audit',
  InReview = 'in_review',
  Approved = 'approved',
  Rejected = 'rejected'
}
export enum MiddeskReportTasksStatuses {
  Success = 'success',
  Warning = 'warning',
  Failure = 'failure'
}

@Entity({ name: 'tblmiddesk' })
export class MiddeskReport extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type:"uuid",default:null})
    loan_id: string;

    @Column({default:null})
    middesk_id: string;
    
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

