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

