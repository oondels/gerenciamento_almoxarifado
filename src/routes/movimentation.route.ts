import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Movimentation } from '../models/Movimentation';
import { Product } from '../models/Product';
import { MovimentationService } from '../services/MovimentationService';
import { MovimentationController } from '../controllers/MovimentationController';
import { validateRequest } from '../middlewares/validate.middleware';
import { createMovimentationSchema } from '../dtos/movimentation.dto';
import { ProductService } from '../services/ProductService';
import { checkUserPermission } from '../middlewares/checkUserPermission';

const router = Router();

const movimentationRepository = AppDataSource.getRepository(Movimentation);
const productRepository = AppDataSource.getRepository(Product);
const productService = new ProductService(productRepository);
const movimentationService = new MovimentationService(movimentationRepository, productRepository);
const movimentationController = new MovimentationController(movimentationService, productService);

router.get('/stats/dashboard', (req, res) => movimentationController.dashboard(req, res));
router.post('/', checkUserPermission(), validateRequest(createMovimentationSchema, 'body'), (req, res) => movimentationController.create(req, res));
router.get('/', (req, res) => movimentationController.getAll(req, res));
router.get('/:id', (req, res) => movimentationController.getById(req, res));
router.get('/product/:productId', (req, res) => movimentationController.getByProduct(req, res));

export default router;
