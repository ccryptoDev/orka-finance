import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated,
  } from 'typeorm';
  import { Flags} from '../configs/config.enum';
  
  export enum LoanProdStatus{
    active = 'ACTIVE',
    inactive='INACTIVE'
}

@Entity({name:'tblproduct'})
export class ProductEntity extends BaseEntity{
    @PrimaryGeneratedColumn({
        name: 'productId',
      })
      productId: number;
      
      @Column({default:null})
      name:string
  
      @Column({default:null})
      type:string
  
      @Column({default:null})
      tenorMonths:string
  
      @Column({default:null})
      tenorYears:string
  
      @Column({default:null})
      interestBaseRate:string
  
      @Column({default:null})
      achDiscount:string
      
      @Column({default:null})
      achDiscountInterestRate:string
  
      @Column({default:null})
      dealerFee:string
  
      @Column({default:null})
      originationFee:string
  
      @Column({
      type: 'enum',
      enum: Flags,
      default: Flags.Y,
      name: 'prepayment_flag',
      })
      prepayment_flag: Flags;
  
      @Column({default:null})
      prepayment:string
  
      @Column({default:null})
      prepaymentMonth:string
  
      @Column({default:null})
      downpayment:string
    
      @Column({default:null})
      mpfAchWItcPrepay:string
  
      @Column({default:null})
      mpfAchWOPrepay:string
  
      @Column({default:null})
      mpfCheckWItcPrepay:string
  
      @Column({default:null})
      mpfCheckWOPrepay:string

      @Column({default:null})
      flexReamPrepayAmount:string

      @Column({default:null})
      flexReamPrepayPercentofPrincipal:string

      @Column({default:null})
      flexReamMaxAnnualFrequency:string

      @Column({default:null})
      phase:string

      @Column({default:null})
      startDate:string

      @Column({default:null})
      endDate:string

      @Column({
          type: 'enum',
          enum: LoanProdStatus,
          default: LoanProdStatus.active,
          name: 'status',
          })
      status: Flags;
  
      @CreateDateColumn()
      createdAt: Date;
  
      @UpdateDateColumn()
      updatedAt: Date;
}