import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity
  } from 'typeorm';
  
  @Entity({ name: 'tblproductlog' })
  export class ProductLogEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    activity: string;
  
    @Column({type:"uuid"})
    installer_id: string;
  
    @Column({type:"uuid"})
    user_id: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  