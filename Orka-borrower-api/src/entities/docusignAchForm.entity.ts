import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'tbldocusignachform' })
export class DocusignAchFormEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  envelopeId: string;

  @Column({ nullable: true })
  s3DocKey: string;

  @Column({ nullable: true })
  recipientIdGuid: string;

  @Column()
  customerName: string;

  @Column()
  documentNumber: string;

  @Column()
  nameOnAccount: string;

  @Column({ nullable: true })
  bankAccNo: string;

  @Column()
  abaNo: string;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  bankCity: string;

  @Column({ nullable: true })
  bankState: string;

  @Column({ nullable: true })
  bankZip: number;

  @Column()
  accountType: string;

  @Column({ default: false })
  customerSigned: boolean;

  @Column({ nullable: true })
  customerSignedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
