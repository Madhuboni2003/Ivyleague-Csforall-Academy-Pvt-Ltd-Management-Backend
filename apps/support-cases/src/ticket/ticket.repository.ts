import { Injectable } from '@nestjs/common';
import { ModelService } from '@app/model';
import { Prisma, Ticket } from '@app/model/generated/prisma/client.js';
import { ListTicketsQuery } from './dto/list-tickets.query.js';

@Injectable()
export class TicketRepository {
    constructor(private readonly prisma: ModelService) {}

    create(data: Prisma.TicketCreateInput): Promise<Ticket> {
        return this.prisma.ticket.create({ data });
    }

    async findMany(query: ListTicketsQuery): Promise<{ tickets: Ticket[]; total: number }> {
        const where: Prisma.TicketWhereInput = {
            ...(query.status && { status: query.status }),
            ...(query.category && { category: query.category }),
            ...(query.learnerId && { learnerId: query.learnerId }),
            ...(query.ownerUserId && { ownerUserId: query.ownerUserId }),
        };

        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' } }),
            this.prisma.ticket.count({ where }),
        ]);

        return { tickets, total };
    }

    findById(id: number): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({ where: { id } });
}

    update(id: number, data: Prisma.TicketUpdateInput): Promise<Ticket> {
        return this.prisma.ticket.update({ where: { id }, data });
    }
}