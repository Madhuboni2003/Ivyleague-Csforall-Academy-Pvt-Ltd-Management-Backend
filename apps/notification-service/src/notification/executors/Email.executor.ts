import { Injectable } from '@nestjs/common';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';

import { sesClient, sesConfig } from '../../configs/aws.config.js';
import { renderTemplate } from '../../templates/template.handler.js';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type.js';
import { TemplateType } from '../enums/TemplateType.enum.js';
import { NotificationExecutorStrategy } from '../strategies/NotificationExecutor.strategy.js';

@Injectable()
export class EmailExecutor implements NotificationExecutorStrategy {
    async send(payload: NotificationExecutorPayload): Promise<string> {
        if (!payload.emailParams) {
            throw new Error('Email content is required');
        }

        const htmlContent = await renderTemplate(
            payload.templateKey,
            TemplateType.HTML,
            payload.emailParams,
        );

        const textContent = await renderTemplate(
            payload.templateKey,
            TemplateType.TEXT,
            payload.emailParams,
        );

        const command = new SendEmailCommand({
            FromEmailAddress: `${sesConfig.fromName} <${sesConfig.fromEmail}>`,
            Destination: {
                ToAddresses: [payload.recipient],
            },
            ReplyToAddresses: [sesConfig.replyToEmail],
            ConfigurationSetName: sesConfig.configurationSetName,
            Content: {
                Simple: {
                    Subject: {
                        Data: payload.subject,
                        Charset: 'UTF-8',
                    },
                    Body: {
                        Html: {
                            Data: htmlContent,
                            Charset: 'UTF-8',
                        },
                        Text: {
                            Data: textContent,
                            Charset: 'UTF-8',
                        },
                    },
                },
            },
        });

        const response = await sesClient.send(command);

        if (!response.MessageId) {
            throw new Error('SES email sent but MessageId was not returned');
        }

        return response.MessageId;
    }
}