import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ModelModule } from '@app/model';
import { RbacModule, RolesGuard } from '@app/rbac';
import { CaseModule } from './case/case.module.js';

@Module({
    imports: [
        RbacModule.register(),
        ModelModule,
        CaseModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useExisting: RolesGuard,
        },
    ],
})
export class SupportCasesModule {}