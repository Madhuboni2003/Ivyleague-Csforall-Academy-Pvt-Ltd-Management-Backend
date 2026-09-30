import { SESv2Client } from '@aws-sdk/client-sesv2';

export const sesClient = new SESv2Client({
    region: process.env.AWS_REGION ?? '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
});

export const sesConfig = {
    fromEmail: process.env.SES_FROM_EMAIL ?? '',
    fromName: process.env.SES_FROM_NAME ?? '',
    replyToEmail: process.env.SES_REPLY_TO_EMAIL ?? '',
    configurationSetName:
        process.env.SES_CONFIGURATION_SET_NAME ?? '',
};