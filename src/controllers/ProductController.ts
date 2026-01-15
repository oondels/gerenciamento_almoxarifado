import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { CreateProductDTO, UpdateProductDTO } from '../types/ProductDTO';

export class ProductController {
  constructor(private productService: ProductService) {}

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const products = await this.productService.findAll();
      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const product = await this.productService.findById(id as string);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching product',
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data: CreateProductDTO = req.body;

      // Validate required fields
      if (!data.name || !data.category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required',
        });
      }

      const product = await this.productService.create(data);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating product',
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data: UpdateProductDTO = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be provided for update',
        });
      }

      const product = await this.productService.update(id as string, data);
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 :
                         error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating product',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      await this.productService.delete(id as string);
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Product not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting product',
      });
    }
  }
}
