import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientEntity } from '../clients/client.entity';

export enum PolicyType {
  AUTO = 'AUTO',
  HOGAR = 'HOGAR',
  VIDA = 'VIDA',
  OTRO = 'OTRO',
}

@Entity('policies')
export class PolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  insurer!: string;

  @Column({ type: 'simple-enum', enum: PolicyType, default: PolicyType.AUTO })
  type!: PolicyType;

  @Column({ name: 'expiration_date' })
  expirationDate!: Date;

  @Column({ name: 'is_managed', default: false })
  isManaged!: boolean;

  @Column({ name: 'is_renewed', default: false })
  isRenewed!: boolean;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => ClientEntity, { eager: false, onDelete: 'CASCADE' })
  client!: ClientEntity;

  @Column({ name: 'client_id' })
  clientId!: string;
}
