import { Injectable } from '@nestjs/common';

import { ModelService } from '@app/model';

@Injectable()
export class LearnerRepository {
    constructor(private readonly prisma: ModelService) {}

    findAtRisk() {
        return this.prisma.learnerLifecycle.findMany({
            where: {
                riskFlags: { some: { resolvedAt: null } },
            },
            select: {
                id: true,
                userId: true,
                brandId: true,
                currentStatus: true,
                riskFlags: {
                    where: { resolvedAt: null },
                    select: {
                        id: true,
                        reason: true,
                        flaggedAt: true,
                    },
                    orderBy: {flaggedAt: 'desc',},    
                },
            },
        });
    }
}