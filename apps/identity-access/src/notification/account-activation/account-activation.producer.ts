import { Injectable } from '@nestjs/common';

import {
    accountActivationQueue,
    ACCOUNT_ACTIVATION_JOB,
    AccountActivationNotificationPayload,
} from './account-activation.queue.js';

@Injectable()
export class AccountActivationNotificationProducer {
    async enqueue(
        payload: AccountActivationNotificationPayload,
    ): Promise<void> {
        await accountActivationQueue.add(
            ACCOUNT_ACTIVATION_JOB,
            payload,
        );
    }
}