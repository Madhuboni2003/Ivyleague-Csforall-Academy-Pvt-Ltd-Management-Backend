import { TicketStatus } from '@app/model/generated/prisma/enums.js';
import { z } from 'zod';

const psaUpdatableStatuses = [
    TicketStatus.IN_PROGRESS,
    TicketStatus.AWAITING_LEARNER,
    TicketStatus.ESCALATED,
    TicketStatus.RESOLVED,
] as const;

export const updateTicketSchema = z.object({
    status: z.enum(psaUpdatableStatuses).optional(),
    resolution: z.string().trim().min(1).optional(),
}).refine(
    (data) => data.status !== undefined || data.resolution !== undefined,
    { message: 'At least one of status or resolution must be provided' },
);

export class UpdateTicketDto implements z.infer<typeof updateTicketSchema> {
    status?: z.infer<typeof updateTicketSchema>['status'];
    resolution?: string;
}

export const ticketIdParamSchema = z.coerce.number().int().positive();