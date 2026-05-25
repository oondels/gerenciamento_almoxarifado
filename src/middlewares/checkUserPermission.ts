import { Request, Response, NextFunction } from "express";
import { AllowedUserService } from "../services/allowedUser.service";
import { AllowedUser } from "../models/AllowedUser";
import { AppDataSource } from '../config/database';
import { AppError } from "../utils/AppError";

export const checkUserPermission = (allowedRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const allowedUserRepository = AppDataSource.getRepository(AllowedUser);
    const allowedUserService = new AllowedUserService(allowedUserRepository);
    try {
      const rfid = req.headers['x-rfid'];
      
      if (!rfid) {
        throw new AppError('Ação bloqueada. Informe o rfid no cabeçalho "x-rfid".', 403);
      }
      if (typeof rfid !== 'string') {
        throw new AppError('RFID inválido', 400);
      }
      
      const user = await allowedUserService.getUserAllowed(Number(rfid));
      if (!user) {
        throw new AppError('Usuário não autorizado', 403);
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          throw new AppError('Ação bloqueada. O usuário não tem a permissão necessária para esta ação.', 403);
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
}