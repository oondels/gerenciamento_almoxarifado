import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { CreateProductDTO, UpdateProductDTO } from '../types/ProductDTO';
import { MovimentationService } from '../services/MovimentationService';

/**
 * Controller responsável por gerenciar as requisições relacionadas a produtos.
 * Implementa as operações CRUD e endpoints de consulta.
 */
export class ProductController {
  constructor(private productService: ProductService, private movimentationService: MovimentationService) { }

  /**
   * Lista todos os produtos cadastrados com suporte a filtros.
   * 
   * @param req - Request do Express contendo filtros opcionais em query params
   * @param res - Response do Express
   * @returns Promise com a lista de produtos e metadados
   * 
   * @example
   * GET /api/products?category=Ferragens&stock_status=low_stock
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        stock_status: req.query.stock_status as 'in_stock' | 'out_stock' | 'low_stock' | undefined,
        codigo: req.query.codigo as string | undefined,
        serial_number: req.query.serial_number as string | undefined,
        local_storage: req.query.local_storage as string | undefined,
      };

      // Remove valores indefinidos dos filtros
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );


      const products = await this.productService.findAll(Object.keys(activeFilters).length > 0 ? activeFilters : undefined);

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Busca um produto específico por ID.
   * 
   * @param req - Request do Express contendo o ID do produto nos params
   * @param res - Response do Express
   * @returns Promise com os dados do produto encontrado
   * 
   * @example
   * GET /api/products/:id
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const product = await this.productService.findById(id as string);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching product',
      });
    }
  }

  /**
   * Cria um novo produto no sistema.
   * 
   * @param req - Request do Express contendo os dados do produto no body
   * @param res - Response do Express
   * @returns Promise com o produto criado
   * 
   * @example
   * POST /api/products
   * Body: { "name": "Parafuso", "category": "Ferragens", "quantity": 100 }
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data: CreateProductDTO = req.body;

      // Validate required fields
      if (!data.name || !data.category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required',
        });
      }

      const product = await this.productService.create(data);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating product',
      });
    }
  }

  /**
 * Atualiza um produto existente.
 * 
 * @param req - Request do Express contendo o ID nos params e dados atualizados no body
 * @param res - Response do Express
 * @returns Promise com o produto atualizado
 * 
 * @example
 * PATCH /api/products/:id
 * Body: { "quantity": 150, "value": 5.50 }
 */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data: UpdateProductDTO = req.body;      

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const productToEdit = await this.productService.findById(id as string);
      if (!productToEdit) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Se houver alteração de quantidade cria uma nova movimento de estoque como ajuste
      if (data.quantity && data.quantity !== productToEdit.quantity) {
        await this.movimentationService.create({
          product_id: productToEdit.id,
          quantity: data.quantity - (productToEdit.quantity || 0),
          type: 'adjustment',
          movimented_by: data.updated_by,
          appointment: data.editReason || 'Atualização de quantidade via edição de produto',
        });
      }
      
      if (!data.updated_by) {
        data.updated_by = Number(req.headers['x-rfid'])
      }      

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Deve haver pelo menos um campo alterado para realizar o update',
        });
      }

      const product = await this.productService.update(id as string, data);
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 :
        error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating product',
      });
    }
  }

  /**
   * Remove um produto do sistema.
   * 
   * @param req - Request do Express contendo o ID do produto nos params
   * @param res - Response do Express
   * @returns Promise confirmando a exclusão
   * 
   * @example
   * DELETE /api/products/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;


      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      await this.productService.delete(id as string);
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting product',
      });
    }
  }

  /**
   * Retorna estatísticas e métricas do dashboard de produtos.
   * Suporta filtros por categoria, status de estoque, localização e período.
   * 
   * @param req - Request do Express contendo filtros opcionais em query params
   * @param res - Response do Express
   * @returns Promise com estatísticas agregadas dos produtos
   * 
   * @example
   * GET /api/products/stats/dashboard?year=2026&month=1
   * GET /api/products/stats/dashboard?category=Ferragens&stock_status=low_stock
   */
  async dashboard(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        stock_status: req.query.stock_status as 'in_stock' | 'out_stock' | 'low_stock' | undefined,
        codigo: req.query.codigo as string | undefined,
        serial_number: req.query.serial_number as string | undefined,
        local_storage: req.query.local_storage as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
      };

      // Validação de mês
      if (filters.month !== undefined && (filters.month < 1 || filters.month > 12)) {
        return res.status(400).json({
          success: false,
          message: 'O mês deve estar entre 1 e 12',
        });
      }

      // Validação de ano
      if (filters.year !== undefined && filters.year < 1900) {
        return res.status(400).json({
          success: false,
          message: 'Ano inválido',
        });
      }

      // Validação de datas
      if (filters.start_date && isNaN(filters.start_date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de início inválida',
        });
      }

      if (filters.end_date && isNaN(filters.end_date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de fim inválida',
        });
      }

      if (filters.start_date && filters.end_date && filters.start_date > filters.end_date) {
        return res.status(400).json({
          success: false,
          message: 'A data de início deve ser anterior à data de fim',
        });
      }

      // Remove valores indefinidos dos filtros
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && !isNaN(value as any))
      );

      const stats = await this.productService.getDashboardStats(
        Object.keys(activeFilters).length > 0 ? activeFilters : undefined
      );

      return res.status(200).json({
        success: true,
        data: stats,
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
