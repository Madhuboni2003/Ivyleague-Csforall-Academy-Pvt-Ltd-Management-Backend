import { Module } from '@nestjs/common';

import { NotificationService } from './notification.service.js';
import { EmailExecutor } from './executors/Email.executor.js';
import { AccountActivationProcessor } from './account-activation/account-activation.processor.js';
import { NotificationRepository } from './notification.repository.js';

@Module({
    providers: [
        NotificationService,
        EmailExecutor,
        AccountActivationProcessor,
        NotificationRepository,
    ],
})
export class NotificationModule {}