export type NotificationExecutorPayload = {
    recipient: string;
    recipientName: string;
    subject: string;
    templateKey: string;
    emailParams?: Record<string, string>;
};