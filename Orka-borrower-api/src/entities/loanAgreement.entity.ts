import { EnvelopeStatus } from '../configs/config.enum';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tblloanagreement' })
export class LoanAgreementEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ unique: true })
  loanId: string;

  @Column({ unique: true })
  envelopeId: string;

  @Column()
  totalAdditionalGuarantors: number;

  @Column({ default:false })
  isAchAuthFormAvailable: boolean;

  @Column({
    type: 'enum',
    enum: EnvelopeStatus,
    default: EnvelopeStatus.ENVELOPE_CREATED
  })
  envelopeStatus: EnvelopeStatus;

  @Column({ nullable: true })
  completedEnvelopeS3DocKey: string;

  @Column({
    default: null,
    comment: 'It is going to be the loan.ref_no + a sequence number generated for the loan agreements of a specific loan'
  })
  documentNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
