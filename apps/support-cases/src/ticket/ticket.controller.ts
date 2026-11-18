import { Body, Controller,  Get, Post, Query, Patch,Param } from '@nestjs/common';
import { AccessRole, CurrentUser, Roles , STAFF_ROLES } from '@app/rbac';
import type { Principal } from '@app/rbac';
import { TicketService } from './ticket.service.js';
import { CreateTicketDto, createTicketSchema } from './dto/create-ticket.dto.js';
import { ListTicketsQuery, listTicketsQuerySchema } from './dto/list-tickets.query.js';
import { UpdateTicketDto, updateTicketSchema , ticketIdParamSchema, } from './dto/update-ticket.dto.js';
import { AcceptTicketDto, acceptTicketSchema } from './dto/accept-ticket.dto.js';
    
@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) {}

    @Roles(AccessRole.LEARNER)
    @Post()
    createTicket(
        @CurrentUser() user: Principal,
        @Body({ schema: createTicketSchema }) payload: CreateTicketDto,
    ) {
        return this.ticketService.createTicket(Number(user.userId), payload);
    }

    @Roles(...STAFF_ROLES)
    @Get()
    listTickets(
        @Query({ schema: listTicketsQuerySchema })
        query: ListTicketsQuery,
    ) {
        return this.ticketService.listTickets(query);
    }

    @Roles(AccessRole.PSA)
    @Patch(':id')
    updateTicket(
        @Param('id', { schema: ticketIdParamSchema }) ticketId: number,
        @CurrentUser() user: Principal,
        @Body({ schema: updateTicketSchema }) payload: UpdateTicketDto,
    ) {
        return this.ticketService.updateTicket(
            ticketId,
            Number(user.userId),
            payload,
        );
    }

    @Roles(AccessRole.LEARNER)
    @Patch(':id/accept')
    acceptTicket(
        @Param('id', { schema: ticketIdParamSchema }) ticketId: number,
        @CurrentUser() user: Principal,
        @Body({ schema: acceptTicketSchema }) payload: AcceptTicketDto,
    ) {
        return this.ticketService.acceptTicket(
            ticketId,
            user,
            payload,
        );
    }
}