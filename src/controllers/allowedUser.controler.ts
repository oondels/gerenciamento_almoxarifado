import { NextFunction, Request, Response } from 'express';
import { AllowedUserService } from '../services/allowedUser.service';
import { CreateAllowedUserDTO } from '../types/AllowedUserDTO';
import { AppError } from '../utils/AppError';

export class AllowedUserController {
  constructor(private allowedUserService: AllowedUserService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allowedUsers = await this.allowedUserService.findAll();
      
      res.status(200).json(allowedUsers);
      return;
    } catch (error) {
      next(error);
    }
  }

  async newUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateAllowedUserDTO = req.body;
      
      const newUser = await this.allowedUserService.create(data);
      res.status(201).json(newUser);
      return
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = (req.params as any).id as string | string[] | undefined;

      if (!rawId) {
        throw new AppError('O id do usuário é obrigatório', 400);
      }

      if (Array.isArray(rawId)) {
        throw new AppError('O id do usuário é inválido', 400);
      }

      const id = rawId;

      await this.allowedUserService.delete(id);
      res.status(200).json({ message: 'Usuário removido com sucesso' });
      return
    } catch (error) {
      next(error);
    }
  }
}