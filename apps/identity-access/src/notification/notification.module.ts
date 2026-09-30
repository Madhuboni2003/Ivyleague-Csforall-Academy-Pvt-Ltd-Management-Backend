import { Module } from '@nestjs/common';

import { AccountActivationNotificationProducer } from './account-activation/account-activation.producer.js';

@Module({
    providers: [AccountActivationNotificationProducer],
    exports: [AccountActivationNotificationProducer],
})
export class NotificationModule {}