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
      const reqRfid = Number(req.headers['x-rfid']);
      
      const newUser = await this.allowedUserService.create(data, reqRfid);
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
      const reqRfid = Number(req.headers['x-rfid']);

      await this.allowedUserService.delete(id, reqRfid);
      res.status(200).json({ message: 'Usuário removido com sucesso' });
      return
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const reqRfid = Number(req.headers['x-rfid']);

      if (!id || !role) {
        throw new AppError('Id e role são obrigatórios', 400);
      }

      const updatedUser = await this.allowedUserService.updateRole(id, role, reqRfid);
      res.status(200).json(updatedUser);
      return
    } catch (error) {
      next(error);
    }
  }

  async getNotificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matricula = Number(req.params.matricula);
      if (!matricula || isNaN(matricula)) {
        throw new AppError('Matrícula inválida', 400);
      }

      const enabled = await this.allowedUserService.checkNotificationStatus(matricula);
      res.status(200).json({ enabled });
      return;
    } catch (error) {
      next(error);
    }
  }

  async toggleNotificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matricula = Number(req.params.matricula);
      const { enable } = req.body;

      if (!matricula || isNaN(matricula)) {
        throw new AppError('Matrícula inválida', 400);
      }
      if (typeof enable !== 'boolean') {
        throw new AppError('O campo enable (boolean) é obrigatório', 400);
      }

      const newStatus = await this.allowedUserService.toggleNotificationStatus(matricula, enable);
      res.status(200).json({ enabled: newStatus });
      return;
    } catch (error) {
      next(error);
    }
  }
}