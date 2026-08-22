const { z } = require('zod');

const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(100),
  environment: z.enum(['live', 'test', 'developer', 'enterprise']).default('live'),
  expires_in_days: z.number().int().positive().optional().default(365)
});

module.exports = {
  createKeySchema
};
