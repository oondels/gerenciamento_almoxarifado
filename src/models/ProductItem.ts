import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

@Entity('product_item', { schema: 'almoxarifado' })
export class ProductItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @ManyToOne(() => Product, (product) => product.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  patrimonio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_number?: string;

  @Column({ type: 'varchar', length: 50, default: 'AVAILABLE' })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  current_owner?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  condition?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
