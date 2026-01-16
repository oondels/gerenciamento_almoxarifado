import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../dtos/product.dto';

const router = Router();

const productRepository = AppDataSource.getRepository(Product);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/', (req, res) => productController.list(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.post('/', validateRequest(createProductSchema, 'body'), (req, res) => productController.create(req, res));
router.patch('/:id', validateRequest(updateProductSchema, 'body'), (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

export default router;
