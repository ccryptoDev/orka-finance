import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';
import { disbursementStatus } from '../configs/config.enum';

@Entity({ name: 'tbldisbsequence' })
export class DisbursementEntity extends BaseEntity {
@PrimaryGeneratedColumn({
  name: 'ref_no',
})
ref_no: number;

@Column()
@Generated('uuid')
disbursementSequenceId: string;

@Column({ default: null })
name: string

@Column({ default: null })
total_disbs: string

@Column({ default: null })
m1_percent: string

@Column({
  type: 'enum',
  enum: disbursementStatus,
  default: null,
  name: 'm1_type',
})
m1_type: disbursementStatus;

@Column({ default: null })
m2_percent: string

@Column({
  type: 'enum',
  enum: disbursementStatus,
  default: null,
  name: 'm2_type',
})
m2_type: disbursementStatus;

@Column({ default: null })
m3_percent: string

@Column({
  type: 'enum',
  enum: disbursementStatus,
  default: null,
  name: 'm3_type',
})
m3_type: disbursementStatus;

@Column({ default: null })
m4_percent: string

@Column({
  type: 'enum',
  enum: disbursementStatus,
  default: null,
  name: 'm4_type',
})
m4_type: disbursementStatus;

@Column({ default: null })
m5_percent: string

@Column({
  type: 'enum',
  enum: disbursementStatus,
  //default: disbursementStatus.type5,
  default: null,
  name: 'm5_type',
})
m5_type: disbursementStatus;

@Column({ default: null })
status: string

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}