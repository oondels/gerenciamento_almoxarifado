import { Repository } from 'typeorm';
import { AllowedUser } from '../models/AllowedUser';
import { CreateAllowedUserDTO } from '../types/AllowedUserDTO';
import { AppDataSource } from '../config/database';
import { AppError } from '../utils/AppError';

export class AllowedUserService {
  private queryRunner = AppDataSource.createQueryRunner();

  constructor(private allowedUserRepository: Repository<AllowedUser>) { }

  async findAll(): Promise<AllowedUser[]> {
    try {
      return this.allowedUserRepository.find();
    } catch (error) {
      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async create(data: CreateAllowedUserDTO, reqRfid: number): Promise<AllowedUser> {
    try {
      const admin = await this.getUserAllowed(reqRfid);
      if (!admin) throw new AppError('Admin não encontrado', 404);

      if (admin.role === 'admin' && (data.role === 'admin' || data.role === 'admin_master')) {
        throw new AppError('Ação bloqueada. Você não tem permissão para cadastrar administradores.', 403);
      }
      const user = await this.queryRunner.query(`
        SELECT rfid, matricula, usuario from autenticacao.usuarios
        WHERE matricula = $1 OR rfid = $1
      `, [data.matricula])

      if (!user || user.length === 0) {
        throw new AppError('Usuário não encontrado na base de dados externa', 404);
      }

      const newUser = this.allowedUserRepository.create({
        username: user[0].usuario,
        matricula: user[0].matricula,
        rfid: user[0].rfid,
        role: data.role || 'operator',
      });

      return this.allowedUserRepository.save(newUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async delete(id: string, reqRfid: number): Promise<void> {
    try {
      const admin = await this.getUserAllowed(reqRfid);
      if (!admin) throw new AppError('Admin não encontrado', 404);

      const existing = await this.allowedUserRepository.findOne({ where: { id } });
      if (!existing) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (admin.role === 'admin' && (existing.role === 'admin' || existing.role === 'admin_master')) {
        throw new AppError('Ação bloqueada. Você não tem permissão para remover administradores.', 403);
      }

      await this.allowedUserRepository.remove(existing);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async updateRole(id: string, role: string, reqRfid: number): Promise<AllowedUser> {
    try {
      const admin = await this.getUserAllowed(reqRfid);
      if (!admin) throw new AppError('Admin não encontrado', 404);

      const existing = await this.allowedUserRepository.findOne({ where: { id } });
      if (!existing) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (admin.role === 'admin' && (existing.role === 'admin' || existing.role === 'admin_master' || role === 'admin' || role === 'admin_master')) {
        throw new AppError('Ação bloqueada. Você não tem permissão para gerenciar administradores.', 403);
      }

      existing.role = role;
      return await this.allowedUserRepository.save(existing);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async getUserAllowed(rfid: number): Promise<AllowedUser | null> {
    try {
      const user = await this.allowedUserRepository.findOne({ where: { rfid } });

      return user;
    } catch (error) {
      throw new AppError('Erro interno no servidor', 500);
    }
  }
}