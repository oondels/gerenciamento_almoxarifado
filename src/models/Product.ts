import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, VirtualColumn, AfterLoad } from 'typeorm';
import { Movimentation } from './Movimentation';
import { ProductItem } from './ProductItem';

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

  @Column({ type: 'int', default: 0 })
  loaned_quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  local_storage?: string;

  @Column({ type: 'bigint' })
  created_by!: number;

  @Column({ type: 'bigint', nullable: true})
  updated_by?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Movimentation, (movimentation) => movimentation.product)
  movimentations!: Movimentation[];

  @OneToMany(() => ProductItem, (item) => item.product)
  items!: ProductItem[];

  @Column({ type: 'boolean', default: false })
  is_traceable!: boolean;

  @VirtualColumn({ query: (alias) => `SELECT COUNT("id") FROM "almoxarifado"."product_item" WHERE "product_id" = ${alias}.id AND "status" = 'AVAILABLE'` })
  available_items_count!: number;

  @AfterLoad()
  syncQuantity() {
    if (this.is_traceable) {
      if (this.available_items_count !== undefined && this.available_items_count !== null) {
        this.quantity = Number(this.available_items_count);
      } else if (this.items) {
        this.quantity = this.items.filter(i => i.status === 'AVAILABLE').length;
      }
    }
  }
}
