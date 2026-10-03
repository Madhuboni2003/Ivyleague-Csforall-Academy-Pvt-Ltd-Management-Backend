import { z } from 'zod';

export const recordDecisionSchema = z.object({
    decision: z
        .string({ error: 'decision is required' })
        .trim()
        .min(1, 'decision is required')
        .max(1000, 'decision must be at most 1000 characters'),
});

export const recordDecisionParamsSchema = z.object({
    id: z.coerce
        .number({ error: 'case id must be a number' })
        .int('case id must be an integer')
        .positive('case id must be a positive integer')
        .max(2_147_483_647, 'case id is out of range'),
});

export class RecordDecisionDto implements z.infer<
    typeof recordDecisionSchema
> {
    decision: string;
}