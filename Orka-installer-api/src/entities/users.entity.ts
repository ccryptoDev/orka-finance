import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum Flags {
  N = 'N',
  Y = 'Y'
}



@Entity({ name: 'tbluser' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column({default:null})
  lastName: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Column({
      type:'enum',
      enum: Flags,
      default: Flags.N,
  })
  delete_flag: Flags;

  @Column({
    type:'enum',
    enum: Flags,
    default: Flags.N,
  })
  emailVerify: Flags;
  
  @Column({
      type:'enum',
      enum: Flags,
      default: Flags.N,
  })
  active_flag: Flags;

  @Column({ default: 0 })
  role: number;

  @Column({type: "uuid", default: null})
  mainInstallerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    const hashPassword = await bcrypt.compare(password, this.password);
    return hashPassword;
  }
}
