import { Injectable } from '@nestjs/common';

import { NotificationDto } from './dto/notification.dto.js';
import { EmailExecutor } from './executors/Email.executor.js';
import { NotificationChannel } from './enums/NotificationChannel.enum.js';
import { NotificationRepository } from './notification.repository.js';

@Injectable()
export class NotificationService {
    constructor(
        private readonly emailExecutor: EmailExecutor,
        private readonly notificationRepository:
            NotificationRepository,
    ) {}

    async sendNotification(
        payload: NotificationDto,
    ): Promise<void> {
        for (const channel of payload.channels) {
            if (channel !== NotificationChannel.EMAIL) {
                continue;
            }

            const template =
                await this.notificationRepository.findTemplate(
                    payload.templateKeys[channel],
                    channel,
                    payload.brandId,
                );

            if (!template) {
                throw new Error(
                    `Notification template not found: ${payload.templateKeys[channel]}`,
                );
            }

            try {
                await this.emailExecutor.send({
                    recipient: payload.recipientEmail,
                    recipientName: payload.recipientName,
                    subject: template.subject,
                    templateKey: payload.templateKeys[channel],
                    emailParams: payload.data,
                });

                await this.notificationRepository.createLog({
                    templateId: template.id,
                    recipientUserId:
                        payload.recipientUserId,
                    channel,
                    status: 'SENT',
                    sentAt: new Date(),
                });
            } catch (error) {
                await this.notificationRepository.createLog({
                    templateId: template.id,
                    recipientUserId:
                        payload.recipientUserId,
                    channel,
                    status: 'FAILED',
                    sentAt: new Date(),
                });

                throw error;
            }
        }
    }
}