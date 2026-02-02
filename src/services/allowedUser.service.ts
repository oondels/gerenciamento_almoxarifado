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

  async create(data: CreateAllowedUserDTO): Promise<AllowedUser> {
    try {
      const user = await this.queryRunner.query(`
        SELECT rfid, matricula, usuario from autenticacao.usuarios
        WHERE matricula = $1
      `, [data.matricula])

      if (!user || user.length === 0) {
        throw new AppError('Usuário não encontrado na base de dados externa', 404);
      }

      const newUser = this.allowedUserRepository.create({
        username: user[0].usuario,
        matricula: user[0].matricula,
        rfid: user[0].rfid,
      });

      return this.allowedUserRepository.save(newUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.allowedUserRepository.findOne({ where: { id } });
      if (!existing) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await this.allowedUserRepository.remove(existing);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno no servidor', 500);
    }
  }

  async isUserAllowed(rfid: number): Promise<boolean> {
    try {
      const user = await this.allowedUserRepository.findOne({ where: { rfid } });

      return !!user;
    } catch (error) {
      throw new AppError('Erro interno no servidor', 500);
    }
  }
}