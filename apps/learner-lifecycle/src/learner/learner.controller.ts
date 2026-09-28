import { Controller, Get } from '@nestjs/common';

import {
    AccessRole,
    Roles,
} from '@app/rbac';

import { LearnerService } from './learner.service.js';

@Controller('learners')
export class LearnerController {
    constructor(
        private readonly learnerService: LearnerService,
    ) {}

    @Roles(
        AccessRole.PSA,
        AccessRole.ACADEMIC_HEAD,
    )
    @Get('at-risk')
    findAtRisk() {
        return this.learnerService.findAtRisk();
    }
}