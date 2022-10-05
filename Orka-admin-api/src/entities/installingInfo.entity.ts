import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';

  export enum InstallingStatusFlags {
    documentsUploaded = 'documentsUploaded',
    verifiedAndApproved = 'verifiedAndApproved',
    milestone1Completed = 'milestone1Completed',
    milestone2Completed = 'milestone2Completed',
    milestone3Completed = 'milestone3Completed',
    projectCompleted = 'projectCompleted'
  }

  @Entity({ name: 'tblinstallinginfo' })
  export class InstallingInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    ref_no: number;

    @Column()
    @Generated("uuid")
    id: string;
  
    @Column({type:"uuid", default:null})
    loan_id: string;  

    @Column({type:"uuid", default:null})
    user_id: string;  

    @Column({
      type:'enum',
      enum: InstallingStatusFlags,
      default: null,
    })
    status: InstallingStatusFlags;

    @Column({type:"float", default:0})
    milestone1ReqAmount: number

    @Column({type:"float", default:0})
    milestone2ReqAmount: number

    @Column({type:"float", default:0})
    milestone3ReqAmount: number

    @Column({default:null})
    milestone1signature: string

    @Column({default:null})
    milestone2signature: string

    @Column({default:null})
    milestone3signature: string

    @Column({type:"date", default:null})
    projectCompletedAt: string;

    @Column({type:"boolean", default:false})
    verifiedInstAddress: boolean;

    @Column({default:null})
    approvedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date; 
    
  }
  