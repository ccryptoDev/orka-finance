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
  
@Entity({ name: 'tblfiles' })
export class FilesEntity extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({type:"uuid"})
link_id: string;

@Column()
services: string;

@Column()
originalname: string;

@Column()
filename: string;

@Column({default:null})
documentType: string;

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

