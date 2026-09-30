import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { UserRepository } from './user.repsitory.js';
import { UserStaffModule } from '../user-staff/user-staff.module.js';
import { HashModule } from '../hash/hash.module.js';
import { AccessTokenModule } from '../access-token/access-token.module.js';
import { UserBrandAccessModule } from '../user-brand-access/user-brand-access.module.js';
import { BrandModule } from '../brand/brand.module.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
    imports: [
        UserStaffModule,
        HashModule,
        AccessTokenModule,
        UserBrandAccessModule,
        BrandModule,
        NotificationModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserRepository],
})
export class UserModule {}
