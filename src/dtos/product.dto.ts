import Joi from 'joi';

/**
 * Schema de validação para criação de produto.
 * Campos obrigatórios: name, category
 */
export const createProductSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': 'O nome do produto é obrigatório.',
      'string.max': 'O nome do produto deve ter no máximo 255 caracteres.',
      'any.required': 'O nome do produto é obrigatório.'
    }),

  category: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'A categoria do produto é obrigatória.',
      'string.max': 'A categoria deve ter no máximo 100 caracteres.',
      'any.required': 'A categoria do produto é obrigatória.'
    }),

  codigo: Joi.string()
    .max(50)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O código deve ter no máximo 50 caracteres.'
    }),

  serial_number: Joi.string()
    .max(100)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O número de série deve ter no máximo 100 caracteres.'
    }),

  minimal_quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'A quantidade mínima deve ser um número.',
      'number.integer': 'A quantidade mínima deve ser um número inteiro.',
      'number.min': 'A quantidade mínima não pode ser negativa.'
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'A quantidade deve ser um número.',
      'number.integer': 'A quantidade deve ser um número inteiro.',
      'number.min': 'A quantidade não pode ser negativa.'
    }),

  value: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'O valor deve ser um número.',
      'number.min': 'O valor não pode ser negativo.'
    }),

  local_storage: Joi.string()
    .max(100)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O local de armazenamento deve ter no máximo 100 caracteres.'
    }),

  created_by: Joi.alternatives()
    .try(
      Joi.string().max(100),
      Joi.number()
    )
    .required()
    .messages({
      'alternatives.types': 'O campo "created_by" deve ser uma string ou um número.',
      'any.required': 'O campo "created_by" é obrigatório.'
    })
});

/**
 * Schema de validação para atualização de produto.
 * Todos os campos são opcionais, mas pelo menos um deve ser fornecido.
 */
export const updateProductSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.empty': 'O nome do produto não pode estar vazio.',
      'string.max': 'O nome do produto deve ter no máximo 255 caracteres.'
    }),

  codigo: Joi.string()
    .max(50)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O código deve ter no máximo 50 caracteres.'
    }),

  serial_number: Joi.string()
    .max(100)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O número de série deve ter no máximo 100 caracteres.'
    }),

  minimal_quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'A quantidade mínima deve ser um número.',
      'number.integer': 'A quantidade mínima deve ser um número inteiro.',
      'number.min': 'A quantidade mínima não pode ser negativa.'
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'A quantidade deve ser um número.',
      'number.integer': 'A quantidade deve ser um número inteiro.',
      'number.min': 'A quantidade não pode ser negativa.'
    }),

  value: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'O valor deve ser um número.',
      'number.min': 'O valor não pode ser negativo.'
    }),

  local_storage: Joi.string()
    .max(100)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'O local de armazenamento deve ter no máximo 100 caracteres.'
    })
});
