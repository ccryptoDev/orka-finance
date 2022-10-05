import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';
import { EmployerLanguage, Flags } from '../configs/config.enum';

@Entity({ name: 'tblcustomer' })
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ref_no',
  })
  refNo: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column()
  @Generated('uuid')
  loanId: string;

  @Column()
  email: string;

  @Column()
  legalName: string;

  @Column({ default: null })
  taxId: string;

  @Column({ default: null })
  startDate: string;

  @Column({ default: null })
  empContractCount: string;

  @Column({ default: null })
  businessPhone: string;

  // @Column({ default: null })
  // applicantLegalName: string;

  @Column({ default: null })
  businessAddress: string;

  @Column({ default: null })
  city: string;

  @Column({ default: null })
  state: string;

  @Column({ default: null })
  zipCode: string;

  // @Column({ default: null })
  // yearOfOwnership: string;

  @Column({ default: null })
  businessStructure: string;

  @Column({ default: null })
  businessIndustry: string;

  @Column({ default: null })
  businessBipocowned: string;

  @Column({ default: null })
  lastYearRevenue: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'taxExempt_flag',
  })
  taxExempt: Flags;

  @Column({ default: null })
  taxExemptNumber: string;

  @Column({ default: null })
  ownerFirstName: string;

  @Column({ default: null })
  ownerLastName: string;

  @Column({ default: null })
  ownerEmail: string;

  @Column({ default: null })
  ownerDOB: string;

  @Column({ default: null })
  ownerSSN: string;

  @Column({ default: null })
  ownerPhone: string;

  @Column({ default: null })
  ownerAddress: string;

  @Column({ default: null })
  ownerCity: string;

  @Column({ default: null })
  ownerState: string;

  @Column({ default: null })
  ownerZipCode: string;

  @Column({ default: null })
  ownerProfessionalTitle: string;

  @Column({ default: null })
  ownerAnnualIncome: string;
  // @Column({ default: null })
  // ownerAnnualIncome: number;

  @Column({ default: null })
  ownerPercentage: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'owner2',
  })
  owner2: Flags;

  @Column({
    type: 'uuid',
    default: null,
    name: 'owner2Id',
  })
  owner2Id: string;

  @Column({ default: null })
  owner2FirstName: string;

  @Column({ default: null })
  owner2LastName: string;

  @Column({ default: null })
  owner2Email: string;

  @Column({ default: null })
  owner2DOB: string;

  @Column({ default: null })
  owner2SSN: string;

  @Column({ default: null })
  owner2Phone: string;

  @Column({ default: null })
  owner2Address: string;

  @Column({ default: null })
  owner2City: string;

  @Column({ default: null })
  owner2State: string;

  @Column({ default: null })
  owner2ZipCode: string;

  @Column({ default: null })
  owner2ProfessionalTitle: string;

  @Column({ default: null })
  owner2AnnualIncome: string;
  // @Column({ default: null })
  // owner2AnnualIncome: number;

  @Column({ default: null })
  owner2Percentage: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'owner3',
  })
  owner3: Flags;

  @Column({
    type: 'uuid',
    default: null,
    name: 'owner3Id',
  })
  owner3Id: string;

  @Column({ default: null })
  owner3FirstName: string;

  @Column({ default: null })
  owner3LastName: string;

  @Column({ default: null })
  owner3Email: string;

  @Column({ default: null })
  owner3DOB: string;

  @Column({ default: null })
  owner3SSN: string;

  @Column({ default: null })
  owner3Phone: string;

  @Column({ default: null })
  owner3Address: string;

  @Column({ default: null })
  owner3City: string;

  @Column({ default: null })
  owner3State: string;

  @Column({ default: null })
  owner3ZipCode: string;

  @Column({ default: null })
  owner3ProfessionalTitle: string;

  @Column({ default: null })
  owner3AnnualIncome: string;
  // @Column({ default: null })
  // owner2AnnualIncome: number;

  @Column({ default: null })
  owner3Percentage: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'businessAddressFlag',
  })
  businessAddressFlag: Flags;

  @Column({ default: null })
  businessInstallAddress: string;

  @Column({ default: null })
  businessInstallCity: string;

  @Column({ default: null })
  businessInstallState: string;

  @Column({ default: null })
  businessInstallZipCode: string;

  @Column({ default: null })
  businessInstallLat: string;

  @Column({ default: null })
  businessInstallLng: string;

  @Column({ default: null })
  estimatedPropertyValue: string;

  @Column({ default: null })
  yearsPropertyOwned: string;

  @Column({ default: null })
  ownershipType: string;

  @Column({ default: null })
  mortageStartDate: string;

  @Column({ default: null })
  mortageTerm: string;

  @Column({ default: null })
  monthlyMortagePayment: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
    name: 'delete_flag',
  })
  deleteFlag: Flags;

  @Column({ default: 0 })
  pgno: number;

  @Column({ default: null })
  distance: string;

  @Column({ default: null })
  creditDays: string;

  @Column({ default: null })
  siteType: string;

  @Column({ default: null })
  electricCompany: string;

  @Column({ default: null })
  avgUtilPerMonth: string;

  @Column({ default: null })
  avgConsumptionPerMonth: string;

  @Column({ default: null })
  arraySize: string;

  @Column({ default: null })
  panelManufacturer: string;

  @Column({ default: null })
  inverterNamePlateCapacity: string;

  @Column({ default: null })
  inverterManufacturer: string;

  @Column({ default: null })
  batteryCapacity: string;

  @Column({ default: null })
  batteryManufacturer: string;

  @Column({ default: null })
  mountType: string;

  @Column({ default: null })
  estGenerationRate: string;

  @Column({ default: null })
  estGeneration: string;

  @Column({ default: null })
  nonSolarEquipmentWork: string;

  @Column({ default: null })
  nonSolarProjectCost: string;

  @Column({ default: null })
  totalProjectCost: string;

  @Column({ default: null })
  loanProductID: string;

  @Column({ default: null })
  lifeCycleStage: string;

  @Column({ default: null })
  expectedRevGrowth: string;

  @Column({ default: null })
  growthDrivers: string;

  @Column({ default: null })
  profitabilityGrowth: string;

  @Column({ default: null })
  liabilities: string;

  @Column({ default: null })
  challenges: string;

  @Column({ default: null })
  otherReason: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
