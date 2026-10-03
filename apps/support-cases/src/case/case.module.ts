import { Module } from '@nestjs/common';

import { CaseController } from './case.controller.js';
import { CaseService } from './case.service.js';
import { CaseRepository } from './case.repository .js';

@Module({
    controllers: [CaseController],
    providers: [CaseRepository, CaseService],
})
export class CaseModule {}