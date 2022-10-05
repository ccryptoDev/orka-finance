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
    Y = 'Y',
  }
  
  @Entity({name:'tblplaidmaster'})
  export class PlaidMasterEntity extends BaseEntity{
    @PrimaryGeneratedColumn({name: 'ref_no',})
      refNo: number;

    @Column()
    @Generated('uuid')
    id: string;

    @Column({type:"uuid"})
    user_id: string;

    @Column({type:"uuid"})
    loan_id: string;

    @Column({default: null})
    institutionName: string;

    @Column({default: null})
    bankHolderName: string;

    @Column({ default:null})
    plaid_access_token:string

    @Column({ default: null })
    asset_report_token:string

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