import Joi from 'joi';

/**
 * Schema de validação para criação de movimentação.
 * Campos obrigatórios: type, productId, responsibleUserId, quantity
 */
export const createMovimentationSchema = Joi.object({
  type: Joi.string()
    .valid('inbound', 'outbound', 'transfer', 'adjustment')
    .required()
    .messages({
      'string.empty': 'O tipo de movimentação é obrigatório.',
      'any.only': 'O tipo de movimentação deve ser: inbound, outbound, transfer ou adjustment.',
      'any.required': 'O tipo de movimentação é obrigatório.'
    }),

  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'O ID do produto é obrigatório.',
      'string.guid': 'O ID do produto deve ser um UUID válido.',
      'any.required': 'O ID do produto é obrigatório.'
    }),

  movimented_by: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'O ID do usuário responsável deve ser um número.',
      'number.integer': 'O ID do usuário responsável deve ser um número inteiro.',
      'number.positive': 'O ID do usuário responsável deve ser positivo.',
      'any.required': 'O ID do usuário responsável é obrigatório.'
    }),

  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'A quantidade deve ser um número.',
      'number.integer': 'A quantidade deve ser um número inteiro.',
      'number.positive': 'A quantidade deve ser maior que zero.',
      'any.required': 'A quantidade é obrigatória.'
    }),

  new_location: Joi.string()
    .max(255)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'A nova localização deve ter no máximo 255 caracteres.'
    }),

  notes: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'As notas devem ser texto.'
    })
});
