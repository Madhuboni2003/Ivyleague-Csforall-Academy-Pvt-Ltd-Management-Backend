import { Queue } from 'bullmq';

import { bullMqConnection } from '../../configs/bullMq.config.js';
import { NotificationDto } from '../dto/notification.dto.js';

export const ACCOUNT_ACTIVATION_QUEUE = 'account-activation-notification-queue';

export const ACCOUNT_ACTIVATION_JOB =
    'job:account-activation-notification';

export const accountActivationQueue = new Queue<NotificationDto>(
    ACCOUNT_ACTIVATION_QUEUE,
    {
        connection: bullMqConnection,

        defaultJobOptions: {
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },

            removeOnComplete: {
                age: 24 * 60 * 60,
                count: 1000,
            },

            removeOnFail: {
                age: 7 * 24 * 60 * 60,
                count: 5000,
            },
        },
    },
);