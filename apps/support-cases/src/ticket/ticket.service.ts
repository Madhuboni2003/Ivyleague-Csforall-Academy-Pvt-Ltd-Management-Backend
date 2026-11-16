import { Injectable ,NotFoundException, BadRequestException} from '@nestjs/common';
import { Ticket } from '@app/model/generated/prisma/client.js';
import { getLearnerIdByUserId } from '../apis/learner-lifecycle.api.js';
import { TicketRepository } from './ticket.repository.js';
import { ListTicketsQuery } from './dto/list-tickets.query.js';
import { TicketStatus } from '@app/model/generated/prisma/enums.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';

@Injectable()
export class TicketService {
    constructor(private readonly ticketRepository: TicketRepository) {}

    async createTicket(userId: number, payload: { category: string; description: string }): Promise<Ticket> {
        const { learnerId } = await getLearnerIdByUserId(userId);
        return this.ticketRepository.create({
            learnerId,
            category: payload.category,
            description: payload.description,
            status: 'OPEN',
        });
    }

    async listTickets(
    query: ListTicketsQuery,
    ): Promise<{ tickets: Ticket[]; total: number }> {
        return this.ticketRepository.findMany(query);
    }

    async updateTicket(ticketId: number, userId: number, payload: UpdateTicketDto): Promise<Ticket> {
        const ticket = await this.ticketRepository.findById(ticketId);

        if (!ticket) throw new NotFoundException('Ticket not found');
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Closed tickets cannot be updated');
        }

        const resolution = payload.resolution ?? ticket.resolution;

        if (payload.status === TicketStatus.RESOLVED && !resolution) {
            throw new BadRequestException('Resolution is required to mark a ticket as RESOLVED');
        }

        return this.ticketRepository.update(ticketId, {
            ...(payload.status !== undefined && { status: payload.status }),
            ...(payload.resolution !== undefined && { resolution: payload.resolution }),
            ...(payload.status === TicketStatus.IN_PROGRESS &&
                ticket.status !== TicketStatus.IN_PROGRESS &&
                ticket.ownerUserId === null && { ownerUserId: userId }),
        });
    }
}