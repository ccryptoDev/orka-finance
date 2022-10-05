import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'tbldocusignpersonalguarantor' })
export class DocusignPersonalGuarantorEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  envelopeId: string;

  @Column({ nullable: true })
  s3DocKey: string;

  @Column({ nullable: true })
  recipientIdGuid: string;

  @Column()
  envelopeCreationDate: Date;

  @Column()
  guarantorName: string;

  @Column()
  borrowerCmpName: string;

  @Column({ default: false })
  guarantorSigned: boolean;

  @Column({ nullable: true })
  guarantorSignedDate: Date;

  @Column()
  guarantorAddress: string;

  @Column()
  guarantorPhone: string;

  @Column()
  guarantorEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
