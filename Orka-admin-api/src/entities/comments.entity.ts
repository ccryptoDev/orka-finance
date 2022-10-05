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

@Entity({ name: 'tblcomments' })
export class Comments extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type:"uuid", default:null})
    user_id: string;

    @Column({type:"uuid", default:null})
    loan_id: string;

    @Column()
    subject: string;

    @Column()
    comments: string;

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