import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated,
} from 'typeorm';
import { Flags } from '../configs/config.enum';

@Entity({ name: 'tbllendinglimit' })
export class LendingLimitEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Generated('uuid')
    loanId: string;

    @Column({ default: null })
    productId: string

    @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
        name: 'deleteFlag',
    })
    deleteFlag: Flags;

    @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.Y,
        name: 'partnerActivatedProduct',
    })
    partnerActivatedProduct: Flags;

    @Column({ default: null })
    personalGuarantorLimitModeled: string;

    @Column({ default: null })
    personalGuarantorLimitStated: string;

    @Column({ default: null })
    businessBorrowerLimit: string

    @Column({ default: null })
    totalFinancingRequested: string

    @Column({ default: null })
    financingAmountRequested: string;

    @Column({ default: null })
    finalLendingLimit: string

    @Column({ default: null })
    financingApproved: string;

    @Column({ default: null })
    lendingLimit: string;

    @Column({ default: null })
    adjLendingLimit: string;

    @Column({ default: null })
    requiredToVerifyStatedIncome: string;

    @Column({ default: null })
    productName: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}