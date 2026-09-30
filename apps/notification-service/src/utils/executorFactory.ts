import { EmailExecutor } from '../notification/executors/Email.executor.js';
import type { NotificationExecutorStrategy } from '../notification/strategies/NotificationExecutor.strategy.js';
import { NotificationChannel } from '../notification/enums/NotificationChannel.enum.js';

export function createNotificationExecutor(
    channel: NotificationChannel,
): NotificationExecutorStrategy | null {
    if (channel === NotificationChannel.EMAIL) {
        return new EmailExecutor();
    }

    return null;
}