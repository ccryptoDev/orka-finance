import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity
} from 'typeorm';

@Entity({ name: 'tbllog' })
export class LogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module: string;

  @Column({type:"uuid"})
  loan_id: string;

  @Column({type:"uuid"})
  user_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
