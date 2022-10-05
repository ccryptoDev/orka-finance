import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { EmployerLanguage } from '../configs/config.enum';

@Entity({ name: 'tblcoapplication' })
export class CoapplicationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  birthday: string;

  @Column()
  phone: string;

  @Column({ type: 'float' })
  additionalIncome: number;

  @Column()
  employer: string;

  @Column()
  jobTitle: string;

  @Column({ type: 'float' })
  yearsEmployed: number;

  @Column({ type: 'float' })
  monthsEmployed: number;

  @Column()
  homeOccupancy: string;

  @Column()
  homeOwnership: string;
  @Column()
  employmentStatus: string;
  @Column()
  citizenshipStatus: string;
  @Column({
    type: 'enum',
    enum: EmployerLanguage,
    default: EmployerLanguage.ENGLISH,
  })
  spokenLanguage: EmployerLanguage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
