import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { AllowedUserController } from '../controllers/allowedUser.controler';
import { AllowedUserService } from '../services/allowedUser.service';
import { AllowedUser } from '../models/AllowedUser';
import { checkUserPermission } from '../middlewares/checkUserPermission';

const router = Router();

const allowedUserRepository = AppDataSource.getRepository(AllowedUser);
const allowedUserService = new AllowedUserService(allowedUserRepository);
const allowedUserController = new AllowedUserController(allowedUserService);

router.get('/', (req, res, next) => allowedUserController.list(req, res, next));
router.post('/', checkUserPermission(['admin_master', 'admin']), (req, res, next) => allowedUserController.newUser(req, res, next));
router.delete('/:id', checkUserPermission(['admin_master', 'admin']), (req, res, next) => allowedUserController.deleteUser(req, res, next));
router.patch('/:id/role', checkUserPermission(['admin_master', 'admin']), (req, res, next) => allowedUserController.updateRole(req, res, next));

router.get('/:matricula/notification', (req, res, next) => allowedUserController.getNotificationStatus(req, res, next));
router.post('/:matricula/notification/toggle', (req, res, next) => allowedUserController.toggleNotificationStatus(req, res, next));
export default router;