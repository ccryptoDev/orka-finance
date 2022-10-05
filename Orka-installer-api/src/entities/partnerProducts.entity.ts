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

@Entity({name:'tblpartnerproduct'})
export class PartnerProductEntity extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
      id: string;

      @Column({default:null,type:'uuid'})
      installerId:string

      @Column({default:0})
      productId:number
    
      @Column({
        type: 'enum',
        enum: Flags,
        default: Flags.N,
        name: 'active_flag',
      })
      active_flag: Flags;

      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;

}
