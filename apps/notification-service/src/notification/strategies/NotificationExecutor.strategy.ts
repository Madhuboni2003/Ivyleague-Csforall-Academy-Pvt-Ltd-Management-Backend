import type { NotificationExecutorPayload } from '../types/NotificationPayload.type.js';

export interface NotificationExecutorStrategy {
    send(payload: NotificationExecutorPayload): Promise<string>;
}