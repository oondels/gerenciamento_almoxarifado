import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';

const router = Router();

// Initialize repository, service and controller
const productRepository = AppDataSource.getRepository(Product);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Routes
router.get('/', (req, res) => productController.list(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.post('/', (req, res) => productController.create(req, res));
router.patch('/:id', (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

export default router;
