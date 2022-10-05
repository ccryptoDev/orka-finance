import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity
    
  } from 'typeorm';
  
@Entity({ name: 'tblsettings' })
export class SettingsEntity extends BaseEntity {
@PrimaryGeneratedColumn()
id: number;

@Column()
key: string;

@Column()
value: string;

}

