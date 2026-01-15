import { Repository } from 'typeorm';
import { Product } from '../models/Product';
import { CreateProductDTO, UpdateProductDTO } from '../types/ProductDTO';

export class ProductService {
  constructor(private productRepository: Repository<Product>) {}

  async findAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new Error(`Error fetching products: ${error}`);
    }
  }

  async findById(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  async create(data: CreateProductDTO): Promise<Product> {
    try {
      // Validate minimal_quantity
      if (data.minimal_quantity && data.minimal_quantity < 0) {
        throw new Error('Minimal quantity must be greater than or equal to 0');
      }

      // Check if codigo already exists
      if (data.codigo) {
        const existingProduct = await this.productRepository.findOne({
          where: { codigo: data.codigo },
        });

        if (existingProduct) {
          throw new Error('Product with this code already exists');
        }
      }

      const product = this.productRepository.create({
        ...data,
        minimal_quantity: data.minimal_quantity ?? 0,
        quantity: data.quantity ?? 0,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const product = await this.findById(id);

      // Validate minimal_quantity
      if (data.minimal_quantity !== undefined && data.minimal_quantity < 0) {
        throw new Error('Minimal quantity must be greater than or equal to 0');
      }

      // Check if new codigo already exists
      if (data.codigo && data.codigo !== product.codigo) {
        const existingProduct = await this.productRepository.findOne({
          where: { codigo: data.codigo },
        });

        if (existingProduct) {
          throw new Error('Product with this code already exists');
        }
      }

      Object.assign(product, data);

      return await this.productRepository.save(product);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const product = await this.findById(id);
      await this.productRepository.remove(product);
    } catch (error) {
      throw error;
    }
  }
}
