import { AppDataSource } from '../config/database';
import { StorageLocation } from '../models/StorageLocation';
import { Sector } from '../models/Sector';

export class SettingsService {
  private locationRepo = AppDataSource.getRepository(StorageLocation);
  private sectorRepo = AppDataSource.getRepository(Sector);

  // --- Storage Locations ---
  async getStorageLocations() {
    return await this.locationRepo.find({ order: { name: 'ASC' } });
  }

  async createStorageLocation(name: string, adminRfid: number) {
    const existing = await this.locationRepo.findOne({ where: { name } });
    if (existing) {
      throw new Error('Local de armazenamento já existe.');
    }
    const location = this.locationRepo.create({
      name,
      created_by: adminRfid,
    });
    return await this.locationRepo.save(location);
  }

  async updateStorageLocation(id: string, name: string, adminRfid: number) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new Error('Local não encontrado.');

    location.name = name;
    location.updated_by = adminRfid;
    return await this.locationRepo.save(location);
  }

  async deleteStorageLocation(id: string, adminRfid: number) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new Error('Local não encontrado.');
    // TODO: Verify if location is used in products before deleting? 
    // In a real scenario we might block deletion, but for now we follow requirements.
    await this.locationRepo.remove(location);
  }

  // --- Sectors ---
  async getSectors() {
    return await this.sectorRepo.find({ order: { name: 'ASC' } });
  }

  async createSector(name: string, adminRfid: number) {
    const existing = await this.sectorRepo.findOne({ where: { name } });
    if (existing) {
      throw new Error('Setor já existe.');
    }
    const sector = this.sectorRepo.create({
      name,
      created_by: adminRfid,
    });
    return await this.sectorRepo.save(sector);
  }

  async updateSector(id: string, name: string, adminRfid: number) {
    const sector = await this.sectorRepo.findOne({ where: { id } });
    if (!sector) throw new Error('Setor não encontrado.');

    sector.name = name;
    sector.updated_by = adminRfid;
    return await this.sectorRepo.save(sector);
  }

  async deleteSector(id: string, adminRfid: number) {
    const sector = await this.sectorRepo.findOne({ where: { id } });
    if (!sector) throw new Error('Setor não encontrado.');
    await this.sectorRepo.remove(sector);
  }
}
