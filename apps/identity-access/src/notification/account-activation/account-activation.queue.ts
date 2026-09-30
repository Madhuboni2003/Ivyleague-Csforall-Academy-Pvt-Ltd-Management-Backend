import { Queue } from 'bullmq';

const ACCOUNT_ACTIVATION_QUEUE =
    'account-activation-notification-queue';

const ACCOUNT_ACTIVATION_JOB =
    'job:account-activation-notification';

export type AccountActivationNotificationPayload = {
    recipientUserId: number;
    brandId?: number;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    templateKeys: { EMAIL: string };
    channels: ['EMAIL'];
    data: {
        recipientName: string;
        activationUrl: string;
    };
};

export const accountActivationQueue =
    new Queue<AccountActivationNotificationPayload>(
        ACCOUNT_ACTIVATION_QUEUE,
        {
            connection: {
                host: process.env.REDIS_HOST ?? 'localhost',
                port: Number(process.env.REDIS_PORT ?? 6379),
                maxRetriesPerRequest: null,
            },

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

export {
    ACCOUNT_ACTIVATION_QUEUE,
    ACCOUNT_ACTIVATION_JOB,
};