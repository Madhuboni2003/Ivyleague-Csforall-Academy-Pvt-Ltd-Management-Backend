import { Injectable } from '@nestjs/common';

import { ModelService } from '@app/model';
import { EscalationCase } from '@app/model/generated/prisma/client.js';

@Injectable()
export class CaseRepository {
    constructor(private readonly model: ModelService) {}

    async findById(caseId: number): Promise<EscalationCase | null> {
        return this.model.escalationCase.findUnique({
            where: { id: caseId },
        });
    }

    /** Returns true if the decision was recorded, false if the case is missing or already decided. */
    async recordDecision(
        caseId: number,
        decision: string,
        decidedByUserId: number,
        decidedAt: Date,
    ): Promise<boolean> {
        const { count } = await this.model.escalationCase.updateMany({
            where: { id: caseId, decision: null },
            data: { 
                decision, 
                decidedByUserId, 
                decidedAt,
                status: 'CLOSED',
             },
        });

        return count > 0;
    }
}