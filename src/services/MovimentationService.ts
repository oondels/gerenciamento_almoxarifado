import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Movimentation } from '../models/Movimentation';
import { Product } from '../models/Product';
import { ProductItem } from '../models/ProductItem';
import { CreateMovimentationDTO } from '../types/MovimentationDTO';
import { NotificationService } from './NotificationService';
/**
 * Service responsável pela lógica de negócio relacionada a movimentações de estoque.
 * Gerencia entrada, saída, transferência e ajustes de produtos.
 */
export class MovimentationService {
  constructor(
    private movimentationRepository: Repository<Movimentation>,
    private productRepository: Repository<Product>
  ) {}

  /**
   * Cria uma nova movimentação e atualiza automaticamente o estoque do produto.
   * Suporta 4 tipos de movimentações: inbound, outbound, transfer e adjustment.
   * 
   * @param data - Dados da movimentação a ser criada
   * @returns Promise com a movimentação criada incluindo relação com produto
   * @throws Error se o tipo for inválido, produto não existir ou estoque insuficiente
   */
  async create(data: CreateMovimentationDTO): Promise<Movimentation> {
    return AppDataSource.transaction(async (manager) => {
      const movimentationRepository = manager.getRepository(Movimentation);
      const productRepository = manager.getRepository(Product);
      const productItemRepository = manager.getRepository(ProductItem);

      // Validate type
      const validTypes = ['inbound', 'outbound', 'transfer', 'adjustment', 'loan'];
      if (!validTypes.includes(data.type)) {
        throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }

      // Find the product
      const product = await productRepository.findOne({
        where: { id: data.product_id },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Validate quantity
      if (data.quantity <= 0) {
        throw new Error('Quantidade tem que ser maior que 0.');
      }

      // get true current quantity for traceable products
      let currentQuantity = product.quantity;
      if (product.is_traceable) {
        currentQuantity = await productItemRepository.count({
          where: { product_id: product.id, status: 'AVAILABLE' }
        });
      }

      let itemsToUpdate: ProductItem[] = [];

      // Logic for outbound/loan items verification BEFORE anything
      if ((data.type === 'outbound' || data.type === 'loan') && product.is_traceable) {
        if (!data.item_ids || data.item_ids.length !== data.quantity) {
          throw new Error(`For traceable products, you must provide exactly ${data.quantity} item_ids`);
        }
        
        // Find items and lock them
        itemsToUpdate = await productItemRepository.createQueryBuilder("item")
          .setLock("pessimistic_write")
          .where("item.id IN (:...ids)", { ids: data.item_ids })
          .getMany();
          
        if (itemsToUpdate.length !== data.quantity) {
          throw new Error('Some product items were not found.');
        }

        const allAvailable = itemsToUpdate.every(item => item.status === 'AVAILABLE');
        if (!allAvailable) {
          throw new Error('One or more selected items are not AVAILABLE.');
        }
      } else if (data.type === 'outbound' || data.type === 'loan') {
        if (currentQuantity < data.quantity) {
          throw new Error(`Insufficient stock. Available: ${currentQuantity}, Requested: ${data.quantity}`);
        }
      }

      // Calculate new quantity based on type
      let newQuantity = currentQuantity;
      switch (data.type) {
        case 'inbound':
          newQuantity = currentQuantity + data.quantity;
          break;
        case 'outbound':
          newQuantity = currentQuantity - data.quantity;
          break;
        case 'adjustment':
          // For adjustment, the quantity represents the new absolute value
          if (product.is_traceable) {
            throw new Error('Cannot adjust quantity directly for traceable products. Adjust the items instead.');
          }
          newQuantity = data.quantity;
          break;
        case 'transfer':
          // For transfer, we don't change quantity, only location
          newQuantity = currentQuantity;
          break;
        case 'loan':
          newQuantity = currentQuantity - data.quantity;
          product.loaned_quantity += data.quantity;
          break;
      }

      // Create movimentation record with old and new states
      const movimentation = movimentationRepository.create({
        type: data.type,
        product_id: data.product_id,
        movimented_by: data.movimented_by,
        quantity: data.quantity,
        product_old_quantity: currentQuantity,
        product_new_quantity: newQuantity,
        product_old_local_storage: product.local_storage,
        local_storage: data.local_storage || product.local_storage,
        appointment: data.appointment,
        destination_type: data.destination_type,
        destination_value: data.destination_value,
      });

      const savedMovimentation = await movimentationRepository.save(movimentation);

      // Handle product items for inbound (new items)
      if (data.type === 'inbound' && data.items && data.items.length > 0) {
        const newItems = data.items.map(item => productItemRepository.create({
          product_id: product.id,
          patrimonio: item.patrimonio || undefined,
          serial_number: item.serial_number || undefined,
          status: 'AVAILABLE'
        }));
        await productItemRepository.save(newItems);
      }

      // Handle return (inbound) of specific loaned/outbound items
      if (data.type === 'inbound' && data.item_ids && data.item_ids.length > 0) {
        const itemsToReturn = await productItemRepository.createQueryBuilder("item")
          .setLock("pessimistic_write")
          .where("item.id IN (:...ids)", { ids: data.item_ids })
          .getMany();
          
        itemsToReturn.forEach(item => {
          item.status = 'AVAILABLE';
          item.current_owner = undefined;
        });
        await productItemRepository.save(itemsToReturn);
      }

      // Handle product items for outbound/loan
      if ((data.type === 'outbound' || data.type === 'loan') && itemsToUpdate.length > 0) {
        itemsToUpdate.forEach(item => {
          item.status = 'IN_USE';
          item.current_owner = data.destination_value || undefined;
        });
        await productItemRepository.save(itemsToUpdate);
      }

      // Update product quantity and location if needed
      // DO NOT update quantity manually if traceable, because it's computed by @AfterLoad and DB items
      if (!product.is_traceable) {
        product.quantity = newQuantity;
      }
      
      if (data.local_storage) {
        product.local_storage = data.local_storage;
      }
      await productRepository.save(product);

      // Check for low stock alert
      const minQuantity = product.minimal_quantity;
      const crossedMinimal = (currentQuantity > minQuantity && newQuantity <= minQuantity);
      const crossedZero = (currentQuantity > 0 && newQuantity === 0);

      if (crossedMinimal || crossedZero) {
        const notificationService = new NotificationService();
        notificationService.sendLowStockAlert(product, newQuantity);
      }

      // Return movimentation with product relation
      const result = await movimentationRepository.findOne({
        where: { id: savedMovimentation.id },
        relations: ['product'],
      });

      if (!result) {
        throw new Error('Movimentation not found');
      }

      return result;
    });
  }

  /**
   * Busca todas as movimentações cadastradas ordenadas por data de criação.
   * 
   * @returns Promise com array de movimentações incluindo relação com produto
   */
  async findAll(): Promise<Movimentation[]> {
    return this.movimentationRepository.find({
      relations: ['product'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Busca uma movimentação específica por ID.
   * 
   * @param id - UUID da movimentação
   * @returns Promise com a movimentação encontrada incluindo relação com produto
   * @throws Error se a movimentação não for encontrada
   */
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

  /**
   * Busca todas as movimentações de um produto específico.
   * 
   * @param productId - UUID do produto
   * @returns Promise com array de movimentações do produto ordenadas por data
   */
  async findByProduct(productId: string): Promise<Movimentation[]> {
    return this.movimentationRepository.find({
      where: { product_id: productId },
      relations: ['product'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Retorna estatísticas agregadas do dashboard de movimentações.
   * Calcula totais por tipo, movimentações recentes e estatísticas detalhadas.
   * 
   * @param limit - Número máximo de movimentações recentes a retornar (padrão: 10)
   * @param filters - Filtros opcionais por período (ano, mês, datas)
   * @returns Promise com objeto contendo todas as estatísticas
   * @throws Error se houver problema na consulta ao banco de dados
   */

  async getDashboardStats(limit: number = 10, filters?: {
    year?: number;
    month?: number;
    start_date?: Date;
    end_date?: Date;
  }) {
    try {
      // Build base query with date filters
      const buildWhereClause = (qb: any) => {
        if (filters) {
          if (filters.year !== undefined) {
            qb.andWhere('EXTRACT(YEAR FROM movimentation.created_at) = :year', { year: filters.year });
          }
          if (filters.month !== undefined) {
            qb.andWhere('EXTRACT(MONTH FROM movimentation.created_at) = :month', { month: filters.month });
          }
          if (filters.start_date && filters.end_date) {
            qb.andWhere('movimentation.created_at BETWEEN :start_date AND :end_date', {
              start_date: filters.start_date,
              end_date: filters.end_date
            });
          } else if (filters.start_date) {
            qb.andWhere('movimentation.created_at >= :start_date', { start_date: filters.start_date });
          } else if (filters.end_date) {
            qb.andWhere('movimentation.created_at <= :end_date', { end_date: filters.end_date });
          }
        }
      };

      // Contagem total de movimentações
      const totalQuery = this.movimentationRepository.createQueryBuilder('movimentation');
      buildWhereClause(totalQuery);
      const totalMovimentations = await totalQuery.getCount();

      // Movimentações de entrada (inbound)
      const inboundQuery = this.movimentationRepository.createQueryBuilder('movimentation')
        .where('movimentation.type = :type', { type: 'inbound' });
      buildWhereClause(inboundQuery);
      const inboundMovimentations = await inboundQuery.getCount();

      // Movimentações de saída (outbound)
      const outboundQuery = this.movimentationRepository.createQueryBuilder('movimentation')
        .where('movimentation.type = :type', { type: 'outbound' });
      buildWhereClause(outboundQuery);
      const outboundMovimentations = await outboundQuery.getCount();

      // Movimentações de ajuste (adjustment)
      const adjustmentQuery = this.movimentationRepository.createQueryBuilder('movimentation')
        .where('movimentation.type = :type', { type: 'adjustment' });
      buildWhereClause(adjustmentQuery);
      const adjustmentMovimentations = await adjustmentQuery.getCount();

      // Movimentações de transferência (transfer)
      const transferQuery = this.movimentationRepository.createQueryBuilder('movimentation')
        .where('movimentation.type = :type', { type: 'transfer' });
      buildWhereClause(transferQuery);
      const transferMovimentations = await transferQuery.getCount();

      // Últimas movimentações
      const recentQuery = this.movimentationRepository.createQueryBuilder('movimentation')
        .leftJoinAndSelect('movimentation.product', 'product')
        .orderBy('movimentation.created_at', 'DESC')
        .take(limit);
      buildWhereClause(recentQuery);
      const recentMovimentations = await recentQuery.getMany();

      // Estatísticas por tipo
      const statsByTypeQuery = this.movimentationRepository
        .createQueryBuilder('movimentation')
        .select('movimentation.type', 'type')
        .addSelect('COUNT(movimentation.id)', 'count')
        .addSelect('COALESCE(SUM(movimentation.quantity), 0)', 'totalQuantity')
        .groupBy('movimentation.type')
        .orderBy('count', 'DESC');
      buildWhereClause(statsByTypeQuery);
      const statsByType = await statsByTypeQuery.getRawMany();

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
