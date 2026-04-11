const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['owner', 'tenant', 'admin'], { required_error: 'Role is required (owner, tenant, or admin)' })
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
    planType: z.string().optional().nullable(),
    tenantId: z.string().optional().nullable(),
    amount: z.number().positive('Amount must be positive').optional().nullable()
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  createPaymentOrderSchema
};
