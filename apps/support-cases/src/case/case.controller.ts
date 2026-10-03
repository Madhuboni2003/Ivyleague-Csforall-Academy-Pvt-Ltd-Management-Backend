import {
    Body,
    Controller,
    Param,
    Patch,
    UnauthorizedException,
} from '@nestjs/common';

import { AccessRole, CurrentUser, Roles } from '@app/rbac';
import type { Principal } from '@app/rbac';

import { CaseService } from './case.service.js';
import {
    RecordDecisionDto,
    recordDecisionParamsSchema,
    recordDecisionSchema,
} from './dto/record-decision.dto.js';

@Controller('cases')
export class CaseController {
    constructor(private readonly caseService: CaseService) {}

    @Roles(AccessRole.ACADEMIC_HEAD)
    @Patch(':id/decision')
    recordDecision(
        @Param({ schema: recordDecisionParamsSchema })
        params: { id: number },
        @Body({ schema: recordDecisionSchema }) payload: RecordDecisionDto,
        @CurrentUser() actor?: Principal,
    ) {
        if (!actor) {
            throw new UnauthorizedException('Authentication required');
        }

        const actorId = Number(actor.userId);

        if (!Number.isInteger(actorId) || actorId <= 0) {
            throw new UnauthorizedException('Invalid user context');
        }

        return this.caseService.recordDecision(params.id, payload, actorId);
    }
}