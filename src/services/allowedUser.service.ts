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

  async checkNotificationStatus(matricula: number): Promise<boolean> {
    try {
      const userAuth = await this.queryRunner.query(`
        SELECT matricula from autenticacao.usuarios
        WHERE matricula = $1
      `, [matricula]);

      if (!userAuth || userAuth.length === 0) {
        throw new AppError('Usuário não cadastrado na base de autenticação', 404);
      }

      const emailRecord = await this.queryRunner.query(`
        SELECT authorized_notifications_apps 
        FROM autenticacao.emails 
        WHERE matricula = $1
      `, [matricula]);

      if (!emailRecord || emailRecord.length === 0) {
        return false;
      }

      const apps = emailRecord[0].authorized_notifications_apps || [];
      
      return apps.includes('almoxarifado_ti');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro interno no servidor ao checar notificações', 500);
    }
  }

  async toggleNotificationStatus(matricula: number, enable: boolean): Promise<boolean> {
    try {
      const userAuth = await this.queryRunner.query(`
        SELECT matricula from autenticacao.usuarios
        WHERE matricula = $1
      `, [matricula]);

      if (!userAuth || userAuth.length === 0) {
        throw new AppError('Usuário não cadastrado na base de autenticação', 404);
      }

      const emailRecord = await this.queryRunner.query(`
        SELECT authorized_notifications_apps 
        FROM autenticacao.emails 
        WHERE matricula = $1
      `, [matricula]);

      if (!emailRecord || emailRecord.length === 0) {
        throw new AppError('Usuário não possui e-mail cadastrado', 404);
      }

      let apps: string[] = emailRecord[0].authorized_notifications_apps || [];
      const hasApp = apps.includes('almoxarifado_ti');

      if (enable && !hasApp) {
        apps.push('almoxarifado_ti');
      } else if (!enable && hasApp) {
        apps = apps.filter(app => app !== 'almoxarifado_ti');
      }

      await this.queryRunner.query(`
        UPDATE autenticacao.emails
        SET authorized_notifications_apps = $1
        WHERE matricula = $2
      `, [JSON.stringify(apps), matricula]);

      return enable;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro interno no servidor ao atualizar notificações', 500);
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