import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';
  import { Flags,ContractReviewStatus} from '../configs/config.enum';

  @Entity({name:'tblsalescontractreview'})
  export class SalesContractReviewEntity extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    loanid:string;

    @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      businessborrower: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      businessowner: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      projectsiteaddress: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      loanamount: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      modulemanufacturer: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      invertermanufacturer: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      batterymanufacturer: Flags;
      
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
      })
      signaturecheck: Flags;

      
    @Column({default:null})
    comments:string

    @Column({
        type: 'enum',
        enum: ContractReviewStatus,
       default: ContractReviewStatus.needadditionalinfo
    })
    status: ContractReviewStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}