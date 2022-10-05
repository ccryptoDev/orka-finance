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

  @Entity({name:'tbldropdown'})
  export class DropDownEntity extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default:null})
    mainfield:string;

    @Column({default:null})
    value:string

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