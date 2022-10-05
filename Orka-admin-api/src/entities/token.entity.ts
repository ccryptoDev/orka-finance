import {
    Entity,
    Column,
    CreateDateColumn,
    BaseEntity,
    PrimaryColumn
  } from 'typeorm';

  @Entity({ name: 'tbltoken' })
  export class TokenEntity extends BaseEntity {
    @PrimaryColumn()
    email: string;

    @Column()
    token: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  