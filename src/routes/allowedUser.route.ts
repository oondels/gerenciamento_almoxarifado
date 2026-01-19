import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { AllowedUserController } from '../controllers/allowedUser.controler';
import { AllowedUserService } from '../services/allowedUser.service';
import { AllowedUser } from '../models/AllowedUser';

const router = Router();

const allowedUserRepository = AppDataSource.getRepository(AllowedUser);
const allowedUserService = new AllowedUserService(allowedUserRepository);
const allowedUserController = new AllowedUserController(allowedUserService);

router.get('/', (req, res, next) => allowedUserController.list(req, res, next));
router.post('/', (req, res, next) => allowedUserController.newUser(req, res, next));
router.delete('/:id', (req, res, next) => allowedUserController.deleteUser(req, res, next));

export default router;