import { Module } from '@nestjs/common';

import { ModelModule } from '@app/model';

import { NotificationModule } from './notification/notification.module.js';

@Module({
    imports: [
        ModelModule,
        NotificationModule,
    ],
})
export class NotificationServiceModule {}