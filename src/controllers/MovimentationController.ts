import { Request, Response } from 'express';
import { MovimentationService } from '../services/MovimentationService';
import { CreateMovimentationDTO } from '../types/MovimentationDTO';

export class MovimentationController {
  constructor(private movimentationService: MovimentationService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateMovimentationDTO = req.body;

      // Validate required fields
      if (!data.type) {
        res.status(400).json({
          success: false,
          message: 'O tipo de movimentação é obrigatório'
        });
        return;
      }

      if (!data.product_id) {
        res.status(400).json({
          success: false,
          message: 'O ID do produto é obrigatório'
        });
        return;
      }

      if (!data.movimented_by) {
        res.status(400).json({
          success: false,
          message: 'O responsável pela movimentação é obrigatório'
        });
        return;
      }

      if (!data.quantity || data.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'A quantidade é obrigatória e deve ser maior que zero'
        });
        return;
      }

      const movimentation = await this.movimentationService.create(data);

      res.status(201).json({
        success: true,
        message: 'Movimentação criada com sucesso',
        data: movimentation
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }

        if (error.message.includes('Invalid type')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const movimentations = await this.movimentationService.findAll();

      res.status(200).json({
        success: true,
        message: 'Movimentações retornadas com sucesso',
        data: movimentations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const movimentation = await this.movimentationService.findById(id as string);

      res.status(200).json({
        success: true,
        message: 'Movimentação retornada com sucesso',
        data: movimentation
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;

      const movimentations = await this.movimentationService.findByProduct(productId as string);

      res.status(200).json({
        success: true,
        message: 'Movimentations retrieved successfully',
        data: movimentations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  dashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({
          success: false,
          message: 'O limite deve ser um número positivo'
        });
        return;
      }

      const filters = {
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
      };

      // Validação de mês
      if (filters.month !== undefined && (filters.month < 1 || filters.month > 12)) {
        res.status(400).json({
          success: false,
          message: 'O mês deve estar entre 1 e 12'
        });
        return;
      }

      // Validação de ano
      if (filters.year !== undefined && filters.year < 1900) {
        res.status(400).json({
          success: false,
          message: 'Ano inválido'
        });
        return;
      }

      // Validação de datas
      if (filters.start_date && isNaN(filters.start_date.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Data de início inválida'
        });
        return;
      }

      if (filters.end_date && isNaN(filters.end_date.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Data de fim inválida'
        });
        return;
      }

      if (filters.start_date && filters.end_date && filters.start_date > filters.end_date) {
        res.status(400).json({
          success: false,
          message: 'A data de início deve ser anterior à data de fim'
        });
        return;
      }

      // Remove valores indefinidos dos filtros
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && !isNaN(value as any))
      );

      const stats = await this.movimentationService.getDashboardStats(
        limit,
        Object.keys(activeFilters).length > 0 ? activeFilters : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Estatísticas do dashboard retornadas com sucesso',
        data: stats,
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas do dashboard',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
}
