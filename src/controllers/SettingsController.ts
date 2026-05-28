import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';

const settingsService = new SettingsService();

export class SettingsController {
  // --- Storage Locations ---
  async getStorageLocations(req: Request, res: Response) {
    try {
      const locations = await settingsService.getStorageLocations();
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createStorageLocation(req: Request, res: Response) {
    try {
      const { name, adminRfid } = req.body;
      const location = await settingsService.createStorageLocation(name, adminRfid);
      res.status(201).json(location);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStorageLocation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name } = req.body;
      const adminRfid = req.body.adminRfid || req.headers['x-rfid'];
      const location = await settingsService.updateStorageLocation(id, name, Number(adminRfid));
      res.json(location);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteStorageLocation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const adminRfid = req.body.adminRfid || req.headers['x-rfid'];
      await settingsService.deleteStorageLocation(id, Number(adminRfid));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // --- Sectors ---
  async getSectors(req: Request, res: Response) {
    try {
      const sectors = await settingsService.getSectors();
      res.json(sectors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSector(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const adminRfid = req.body.adminRfid || req.headers['x-rfid'];
      const sector = await settingsService.createSector(name, Number(adminRfid));
      res.status(201).json(sector);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name } = req.body;
      const adminRfid = req.body.adminRfid || req.headers['x-rfid'];
      const sector = await settingsService.updateSector(id, name, Number(adminRfid));
      res.json(sector);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const adminRfid = req.body.adminRfid || req.headers['x-rfid'];
      await settingsService.deleteSector(id, Number(adminRfid));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
