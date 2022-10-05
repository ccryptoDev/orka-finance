import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'tbldocusignfinancingcontract' })
export class DocusignFinancingContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  envelopeId: string;

  @Column({ nullable: true })
  s3DocKey: string;

  @Column({ nullable: true })
  borrowerRecipientIdGuid: string;

  @Column({ nullable: true })
  orkaCeoRecipientIdGuid: string;

  @Column()
  borrowerCmpName: string;

  @Column()
  contractorName: string;

  @Column()
  documentNumber: string;

  @Column()
  envelopeCreationDate: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  maxLoanAmt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  originationFee: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  interestRate: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  loanTermMonths: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  m1Amt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  m2Amt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  m3Amt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  checkMonthlyPmt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  achMonthlyPmt: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  targetPrepay1: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  targetPrepay2: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  reamortXTimesPerYear: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  prepayToReamortDollar: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  prepayToReamortPercentage: number;

  @Column()
  projectContractorName: string;

  @Column()
  projectLocation: string;

  @Column()
  moduleMfg: string;

  @Column()
  inverterMfg: string;

  @Column()
  batteryMfg: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  totalInstallmentContract: number;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  optionalTargetPrepay: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  optionalReamortXTimesPerYear: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  optionalPrepayToReamortDollar: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  optionalPrepayToReamortPercentage: number;

  @Column()
  signedBorrowerCmpName: string;

  @Column()
  customerSignerName: string;

  @Column()
  customerSignerTitle: string;

  @Column({ default: false })
  customerSigned: boolean;

  @Column({ nullable: true })
  customerSignedDate: Date;

  @Column({ default: false })
  orkaCeoSigned: boolean;

  @Column({ nullable: true })
  orkaCeoSignedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
