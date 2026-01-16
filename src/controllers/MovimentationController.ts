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
}
