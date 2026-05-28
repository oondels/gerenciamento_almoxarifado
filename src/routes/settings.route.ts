import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { validateRequest } from '../middlewares/validate.middleware';
import { createSettingSchema, updateSettingSchema, deleteSettingSchema } from '../dtos/settings.dto';

const router = Router();
const controller = new SettingsController();

// Storage Locations
router.get('/locations', controller.getStorageLocations);
router.post('/locations', validateRequest(createSettingSchema), controller.createStorageLocation);
router.patch('/locations/:id', validateRequest(updateSettingSchema), controller.updateStorageLocation);
router.delete('/locations/:id', validateRequest(deleteSettingSchema), controller.deleteStorageLocation);

// Sectors
router.get('/sectors', controller.getSectors);
router.post('/sectors', validateRequest(createSettingSchema), controller.createSector);
router.patch('/sectors/:id', validateRequest(updateSettingSchema), controller.updateSector);
router.delete('/sectors/:id', validateRequest(deleteSettingSchema), controller.deleteSector);

export { router as settingsRoutes };
