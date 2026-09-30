import { NotificationChannel } from '../enums/NotificationChannel.enum.js';

export type NotificationDto = {
    recipientUserId: number;
    brandId?: number;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    channels: NotificationChannel[];
    templateKeys: Record<NotificationChannel, string>;
    data: Record<string, string>;
};