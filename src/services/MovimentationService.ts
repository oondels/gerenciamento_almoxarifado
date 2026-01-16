import { Repository } from 'typeorm';
import { Movimentation } from '../models/Movimentation';
import { Product } from '../models/Product';
import { CreateMovimentationDTO } from '../types/MovimentationDTO';

export class MovimentationService {
  constructor(
    private movimentationRepository: Repository<Movimentation>,
    private productRepository: Repository<Product>
  ) {}

  async create(data: CreateMovimentationDTO): Promise<Movimentation> {
    // Validate type
    const validTypes = ['inbound', 'outbound', 'transfer', 'adjustment'];
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Find the product
    const product = await this.productRepository.findOne({
      where: { id: data.product_id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Validate quantity
    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Calculate new quantity based on type
    let newQuantity = product.quantity;
    
    switch (data.type) {
      case 'inbound':
        newQuantity = product.quantity + data.quantity;
        break;
      case 'outbound':
        if (product.quantity < data.quantity) {
          throw new Error(`Insufficient stock. Available: ${product.quantity}, Requested: ${data.quantity}`);
        }
        newQuantity = product.quantity - data.quantity;
        break;
      case 'adjustment':
        // For adjustment, the quantity represents the new absolute value
        newQuantity = data.quantity;
        break;
      case 'transfer':
        // For transfer, we don't change quantity, only location
        newQuantity = product.quantity;
        break;
    }

    // Create movimentation record with old and new states
    const movimentation = this.movimentationRepository.create({
      type: data.type,
      product_id: data.product_id,
      movimented_by: data.movimented_by,
      quantity: data.quantity,
      product_old_quantity: product.quantity,
      product_new_quantity: newQuantity,
      product_old_local_storage: product.local_storage,
      local_storage: data.local_storage || product.local_storage,
      appointment: data.appointment
    });

    // Save movimentation
    const savedMovimentation = await this.movimentationRepository.save(movimentation);

    // Update product quantity and location if needed
    product.quantity = newQuantity;
    if (data.local_storage) {
      product.local_storage = data.local_storage;
    }
    await this.productRepository.save(product);

    // Return movimentation with product relation
    return this.movimentationRepository.findOne({
      where: { id: savedMovimentation.id },
      relations: ['product']
    }) as Promise<Movimentation>;
  }

  async findAll(): Promise<Movimentation[]> {
    return this.movimentationRepository.find({
      relations: ['product'],
      order: { created_at: 'DESC' }
    });
  }

  async findById(id: string): Promise<Movimentation> {
    const movimentation = await this.movimentationRepository.findOne({
      where: { id },
      relations: ['product']
    });

    if (!movimentation) {
      throw new Error('Movimentation not found');
    }

    return movimentation;
  }

  async findByProduct(productId: string): Promise<Movimentation[]> {
    return this.movimentationRepository.find({
      where: { product_id: productId },
      relations: ['product'],
      order: { created_at: 'DESC' }
    });
  }

  async getDashboardStats(limit: number = 10) {
    try {
      // Contagem total de movimentações
      const totalMovimentations = await this.movimentationRepository.count();

      // Movimentações de entrada (inbound)
      const inboundMovimentations = await this.movimentationRepository.count({
        where: { type: 'inbound' }
      });

      // Movimentações de saída (outbound)
      const outboundMovimentations = await this.movimentationRepository.count({
        where: { type: 'outbound' }
      });

      // Movimentações de ajuste (adjustment)
      const adjustmentMovimentations = await this.movimentationRepository.count({
        where: { type: 'adjustment' }
      });

      // Movimentações de transferência (transfer)
      const transferMovimentations = await this.movimentationRepository.count({
        where: { type: 'transfer' }
      });

      // Últimas movimentações
      const recentMovimentations = await this.movimentationRepository.find({
        relations: ['product'],
        order: { created_at: 'DESC' },
        take: limit
      });

      // Estatísticas por tipo
      const statsByType = await this.movimentationRepository
        .createQueryBuilder('movimentation')
        .select('movimentation.type', 'type')
        .addSelect('COUNT(movimentation.id)', 'count')
        .addSelect('COALESCE(SUM(movimentation.quantity), 0)', 'totalQuantity')
        .groupBy('movimentation.type')
        .orderBy('count', 'DESC')
        .getRawMany();

      return {
        totalMovimentations,
        movimentationsByType: {
          inbound: inboundMovimentations,
          outbound: outboundMovimentations,
          adjustment: adjustmentMovimentations,
          transfer: transferMovimentations,
        },
        statsByType: statsByType.map(stat => ({
          type: stat.type,
          count: parseInt(stat.count),
          totalQuantity: parseInt(stat.totalQuantity),
        })),
        recentMovimentations,
      };
    } catch (error) {
      throw new Error(`Error fetching movimentation dashboard stats: ${error}`);
    }
  }
}
