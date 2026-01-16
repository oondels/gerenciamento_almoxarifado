import { Repository } from 'typeorm';
import { Product } from '../models/Product';
import { CreateProductDTO, UpdateProductDTO } from '../types/ProductDTO';

interface ProductFilters {
  category?: string;
  stock_status?: 'in_stock' | 'out_stock' | 'low_stock';
  codigo?: string;
  serial_number?: string;
  local_storage?: string;
}

export class ProductService {
  constructor(private productRepository: Repository<Product>) {}

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      // Filtro por categoria
      if (filters?.category) {
        queryBuilder.andWhere('LOWER(product.category) LIKE LOWER(:category)', {
          category: `%${filters.category}%`,
        });
      }

      // Filtro por status de estoque
      if (filters?.stock_status) {
        switch (filters.stock_status) {
          case 'in_stock':
            queryBuilder.andWhere('product.quantity > 0');
            break;
          case 'out_stock':
            queryBuilder.andWhere('product.quantity = 0');
            break;
          case 'low_stock':
            queryBuilder.andWhere('product.quantity > 0 AND product.quantity <= product.minimal_quantity');
            break;
        }
      }

      // Filtro por código
      if (filters?.codigo) {
        queryBuilder.andWhere('LOWER(product.codigo) LIKE LOWER(:codigo)', {
          codigo: `%${filters.codigo}%`,
        });
      }

      // Filtro por número de série
      if (filters?.serial_number) {
        queryBuilder.andWhere('LOWER(product.serial_number) LIKE LOWER(:serial_number)', {
          serial_number: `%${filters.serial_number}%`,
        });
      }

      // Filtro por local de armazenamento
      if (filters?.local_storage) {
        queryBuilder.andWhere('LOWER(product.local_storage) LIKE LOWER(:local_storage)', {
          local_storage: `%${filters.local_storage}%`,
        });
      }

      queryBuilder.orderBy('product.created_at', 'DESC');

      return await queryBuilder.getMany();
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
