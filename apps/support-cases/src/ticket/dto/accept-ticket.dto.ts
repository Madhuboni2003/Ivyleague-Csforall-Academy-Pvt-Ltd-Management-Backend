import { z } from 'zod';

export const acceptTicketSchema = z.object({
    accepted: z.boolean(),
});

export class AcceptTicketDto implements z.infer<typeof acceptTicketSchema> {
    accepted: boolean;
}