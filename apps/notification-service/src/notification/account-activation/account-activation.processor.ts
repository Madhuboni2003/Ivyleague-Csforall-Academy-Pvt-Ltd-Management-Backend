import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';

import { bullMqConnection } from '../../configs/bullMq.config.js';
import { NotificationDto } from '../dto/notification.dto.js';
import { NotificationService } from '../notification.service.js';
import {
    ACCOUNT_ACTIVATION_JOB,
    ACCOUNT_ACTIVATION_QUEUE,
} from './account-activation.queue.js';

@Injectable()
export class AccountActivationProcessor
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(AccountActivationProcessor.name);

    private worker?: Worker<NotificationDto>;

    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    onModuleInit(): void {
        this.worker = new Worker<NotificationDto>(
            ACCOUNT_ACTIVATION_QUEUE,
            async (job) => {
                if (job.name !== ACCOUNT_ACTIVATION_JOB) {
                    throw new Error(`Invalid job name: ${job.name}`);
                }

                await this.notificationService.sendNotification(job.data);
            },
            {
                connection: bullMqConnection,
                concurrency: 5,
            },
        );

        this.worker.on('completed', (job) => {
            this.logger.log(
                `Account activation notification completed: ${job.id}`,
            );
        });

        this.worker.on('failed', (job, error) => {
            this.logger.error(
                `Account activation notification failed: ${job?.id}`,
                error,
            );
        });

        this.logger.log(
            `Listening on queue: ${ACCOUNT_ACTIVATION_QUEUE}`,
        );
    }

    async onModuleDestroy(): Promise<void> {
        await this.worker?.close();
    }
}