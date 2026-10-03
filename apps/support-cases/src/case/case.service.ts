import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { EscalationCase } from '@app/model/generated/prisma/client.js';

import { CaseRepository } from './case.repository .js';
import { RecordDecisionDto } from './dto/record-decision.dto.js';
import { EscalationCaseType } from './enums/escalation-case-type.enum.js';

@Injectable()
export class CaseService {
    constructor(private readonly caseRepository: CaseRepository) {}

    async recordDecision(
        caseId: number,
        payload: RecordDecisionDto,
        decidedByUserId: number,
    ): Promise<EscalationCase> {
        const escalationCase = await this.caseRepository.findById(caseId);

        if (!escalationCase) {
            throw new NotFoundException('Case not found');
        }

        if (
            escalationCase.caseType !== EscalationCaseType.CONDUCT &&
            escalationCase.caseType !== EscalationCaseType.FINANCE &&
            escalationCase.caseType !== EscalationCaseType.REFUND
        ) {
            throw new BadRequestException(
                'Final decisions can only be recorded for conduct, finance, or refund cases',
            );
        }

        if (escalationCase.decision !== null) {
            throw new ConflictException(
                'A final decision has already been recorded for this case',
            );
        }

        const recorded = await this.caseRepository.recordDecision(
            caseId,
            payload.decision,
            decidedByUserId,
            new Date(),
        );

        if (!recorded) {
            const current = await this.caseRepository.findById(caseId);

            throw current
                ? new ConflictException(
                      'A final decision has already been recorded for this case',
                  )
                : new NotFoundException('Case not found');
        }

        const updatedCase = await this.caseRepository.findById(caseId);

        if (!updatedCase) {
            throw new NotFoundException('Case not found');
        }

        return updatedCase;
    }
}