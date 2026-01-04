import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  providerId!: string;

  @Column()
  type!: string;

  @Column({ type: 'varchar' })
  severity!: string;

  @Column()
  message!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
