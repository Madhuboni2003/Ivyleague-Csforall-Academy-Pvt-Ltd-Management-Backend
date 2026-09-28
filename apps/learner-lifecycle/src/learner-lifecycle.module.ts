import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from '@app/common';
import { ModelModule } from '@app/model';
import { RbacModule, RolesGuard } from '@app/rbac';

import { LearnerModule } from './learner/learner.module.js';

@Module({
    imports: [
        RbacModule.register(),
        CommonModule,
        ModelModule,
        LearnerModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useExisting: RolesGuard,
        },
    ],
})
export class LearnerLifecycleModule {}