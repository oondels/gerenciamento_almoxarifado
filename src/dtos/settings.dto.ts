import Joi from 'joi';

export const createSettingSchema = Joi.object({
  name: Joi.string().max(255).required(),
  adminRfid: Joi.number().required(),
});

export const updateSettingSchema = Joi.object({
  name: Joi.string().max(255).required(),
  adminRfid: Joi.number().required(),
});

export const deleteSettingSchema = Joi.object({
  adminRfid: Joi.number().required(),
});
