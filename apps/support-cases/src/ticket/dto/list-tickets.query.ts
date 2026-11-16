import { z } from 'zod';
import { TicketStatus } from '@app/model/generated/prisma/enums.js';

export const listTicketsQuerySchema = z.object({
    status: z.enum(TicketStatus).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    learnerId: z.coerce.number().int().positive().optional(),
    ownerUserId: z.coerce.number().int().positive().optional(),
});

export class ListTicketsQuery
    implements z.infer<typeof listTicketsQuerySchema>
{
    status?: TicketStatus;
    category?: string;
    learnerId?: number;
    ownerUserId?: number;
}