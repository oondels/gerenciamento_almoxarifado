import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Movimentation } from './Movimentation';

@Entity('produtos', { schema: 'almoxarifado' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  codigo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_number?: string;

  @Column({ type: 'int', default: 0 })
  minimal_quantity!: number;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  local_storage?: string;

  @Column({ type: 'bigint' })
  created_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Movimentation, (movimentation) => movimentation.product)
  movimentations!: Movimentation[];
}
