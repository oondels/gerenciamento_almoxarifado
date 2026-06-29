import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';
import { Movimentation } from '../models/Movimentation';
import { MovimentationService } from '../services/MovimentationService';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../dtos/product.dto';
import { checkUserPermission } from '../middlewares/checkUserPermission';

const router = Router();

const movimentationRepository = AppDataSource.getRepository(Movimentation);
const productRepository = AppDataSource.getRepository(Product);
const movimentationService = new MovimentationService(movimentationRepository, productRepository);
const productService = new ProductService(productRepository);

const productController = new ProductController(productService, movimentationService);

router.get('/stats/dashboard', (req, res) => productController.dashboard(req, res));
router.get('/', (req, res) => productController.list(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.get('/:id/items/available', (req, res) => productController.getAvailableItems(req, res));
router.post('/', checkUserPermission(['admin_master', 'admin', 'operator']), validateRequest(createProductSchema, 'body'), (req, res) => productController.create(req, res));
router.post('/:id/replenish', checkUserPermission(['admin_master', 'admin', 'operator', 'intern']), (req, res) => productController.replenish(req, res));
router.patch('/:id', checkUserPermission(['admin_master', 'admin', 'operator']), validateRequest(updateProductSchema, 'body'), (req, res) => productController.update(req, res));
router.delete('/:id', checkUserPermission(['admin_master', 'admin']), (req, res) => productController.delete(req, res));

export default router;
