import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';

  @Entity({ name: 'tblinstaller' })
  export class Installer extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type:"uuid", default:null})
    user_id: string;

    @Column({default:null})
    businessName: string;

    @Column({default:null})
    businessShortName: string; //url slug
    
    @Column({default:null})
    businessEmail: string;
  
    @Column({default:null})
    businessPhone: string;

    @Column({default:null})
    firstName: string;
    
    @Column({default:null})
    lastName: string;
  
    @Column({default:null})
    businessAddress: string;

    @Column({default:null})
    city: string;
  
    @Column({default:null})
    state: string;
  
    @Column({default:null})
    zipCode: number;

    @Column({default:null})
    contractorLicense: string;

    @Column({default:null})
    contractorLicenseState: string;

    @Column({default:null})
    disbursementSequenceId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
  }
  