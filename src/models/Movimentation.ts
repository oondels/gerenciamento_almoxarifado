import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

@Entity('movimentacao', { schema: 'almoxarifado' })
export class Movimentation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @ManyToOne(() => Product, (product) => product.movimentations)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'bigint' })
  movimented_by!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int', nullable: true })
  product_old_quantity?: number;

  @Column({ type: 'int', nullable: true })
  product_new_quantity?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  local_storage?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  product_old_local_storage?: string;

  @Column({ type: 'text', nullable: true })
  appointment?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  destination_type?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destination_value?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
