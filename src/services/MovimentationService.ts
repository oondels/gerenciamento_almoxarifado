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
}
