import { StaffRole, UserStatus } from '@app/model/generated/prisma/enums.js';

export type StaffAccount = {
    id: number;
    publicId: string;
    fullName: string;
    email: string;
    phone: string;
    status: UserStatus;
    roles: StaffRole[];
    brands: string[];
    activationUrl: string;
    activationExpiresAt: Date;
};
