import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
    
  } from 'typeorm';

  export enum Flags {
    N = 'N',
    Y = 'Y'
  }

  @Entity({ name: 'tbluserdebitcard' })
  export class UserDebitCard extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type:"uuid", default:null})
    user_id: string;

    @Column()
    fullName: string;

    @Column({type:"bigint"})
    cardNumber: number;

    @Column()
    expires: string;

    @Column()
    csc: number;

    @Column()
    billingAddress: string;

    @Column({
        type:'enum',
        enum: Flags,
        default: Flags.N,
    })
    active_flag: Flags;

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