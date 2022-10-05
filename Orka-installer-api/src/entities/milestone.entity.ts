import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';
  import { Flags} from '../configs/config.enum';

  @Entity({name:'tblmilestone'})
  export class MilestoneEntity extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ref_no:string;

    @Column()
    loanid:string;

    @Column()
    milestone:string;
   
    @Column({default:null})
    comments:string

    @Column({default:null})
    status:string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}