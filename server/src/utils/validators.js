const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['owner', 'tenant'], { required_error: 'Role is required (owner or tenant)' })
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty')
  })
});

const createPaymentOrderSchema = z.object({
  body: z.object({
    type: z.enum(['SUBSCRIPTION', 'RENT'], { required_error: 'Payment type is required' }),
    planType: z.string().optional(),
    tenantId: z.string().optional(),
    amount: z.number().positive('Amount must be positive').optional()
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  createPaymentOrderSchema
};
