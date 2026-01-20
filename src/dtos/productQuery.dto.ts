import Joi from 'joi';

/**
 * Schema de validação para query params da listagem de produtos.
 * Todos os campos são opcionais.
 */
export const productQuerySchema = Joi.object({
  category: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'A categoria deve ter no máximo 100 caracteres.'
    }),

  stock_status: Joi.string()
    .valid('in_stock', 'out_stock', 'low_stock')
    .optional()
    .messages({
      'any.only': 'O status de estoque deve ser: in_stock, out_stock ou low_stock.'
    }),

  codigo: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'O código deve ter no máximo 50 caracteres.'
    }),

  serial_number: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'O número de série deve ter no máximo 100 caracteres.'
    }),

  local_storage: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'O local de armazenamento deve ter no máximo 255 caracteres.'
    })
});
