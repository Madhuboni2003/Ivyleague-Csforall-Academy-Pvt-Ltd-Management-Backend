import { randomBytes } from 'crypto';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { ModelService } from '@app/model';
import {
    Brand,
    Prisma,
    StaffRole,
    TokenPurpose,
    User,
    UserStatus,
    UserType,
} from '@app/model/generated/prisma/client.js';

import { HashService } from '../hash/hash.service.js';
import { AccessTokenRepository } from '../access-token/access-token.repository.js';
import { AccessTokenService } from '../access-token/access-token.service.js';
import { BrandRepository } from '../brand/brand.repository.js';
import { UserBrandAccessRepository } from '../user-brand-access/user-brand-access.repository.js';
import { GrantBrandAccessDto } from './dto/grant-brand-access.dto.js';
import { GrantStaffRolesDto } from './dto/grant-staff-roles.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UserStaffRepository } from '../user-staff/user-staff.repository.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { CreateLearnerDto } from './dto/create-learner.dto.js';
import { UserRepository } from './user.repsitory.js';
import { StaffAccount } from './types/staff-account.type.js';
import { LearnerAccount } from './types/learner-account.type.js';
import { IssuedAccessToken } from '../access-token/types/issues-access-token.type.js';
import { AccountActivationNotificationProducer } from '../notification/account-activation/account-activation.producer.js';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: ModelService,
        private readonly userRepository: UserRepository,
        private readonly userStaffRepository: UserStaffRepository,
        private readonly hashService: HashService,
        private readonly accessTokenRepository: AccessTokenRepository,
        private readonly accessTokenService: AccessTokenService,
        private readonly brandRepository: BrandRepository,
        private readonly userBrandAccessRepository: UserBrandAccessRepository,
        private readonly accountActivationNotificationProducer: AccountActivationNotificationProducer,
    ) {}

    async updateUserStatus(
        userPublicId: string,
        payload: UpdateUserStatusDto,
        actorUserId?: string,
    ): Promise<{ publicId: string; fullName: string; status: UserStatus }> {
        const user: User | null =
            await this.userRepository.findByPublicId(userPublicId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (actorUserId && actorUserId === String(user.id)) {
            throw new BadRequestException(
                'You cannot change the status of your own account',
            );
        }

        if (
            user.status === UserStatus.UNACTIVATED &&
            payload.status === UserStatus.ACTIVE
        ) {
            throw new BadRequestException(
                'This account has never been activated. It must be activated through its invitation link.',
            );
        }

        if (user.status === payload.status) {
            return {
                publicId: user.publicId,
                fullName: user.fullName,
                status: user.status,
            };
        }

        const updated: User = await this.userRepository.updateStatus(
            user.id,
            payload.status,
        );

        return {
            publicId: updated.publicId,
            fullName: updated.fullName,
            status: updated.status,
        };
    }

    async createLearner(payload: CreateLearnerDto): Promise<LearnerAccount> {
        const existing: User | null = await this.userRepository.findByEmail(
            payload.email,
        );

        if (existing) {
            if (existing.userType !== UserType.LEARNER) {
                throw new ConflictException(
                    'This email belongs to a staff account and cannot be enrolled as a learner',
                );
            }

            return {
                publicId: existing.publicId,
                fullName: existing.fullName,
                email: existing.email,
                phone: existing.phone,
                status: existing.status,
                created: false,
            };
        }

        const passwordHash = await this.hashService.hash(
            randomBytes(32).toString('hex'),
        );

        const learner: User = await this.userRepository.create(
            {
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                passwordHash,
                userType: UserType.LEARNER,
                status: UserStatus.UNACTIVATED,
            },
            this.prisma,
        );

        return {
            publicId: learner.publicId,
            fullName: learner.fullName,
            email: learner.email,
            phone: learner.phone,
            status: learner.status,
            created: true,
        };
    }

    private async resolveBrandsByCode(codes: string[]): Promise<Brand[]> {
        if (codes.length === 0) {
            return [];
        }

        const brands: Brand[] =
            await this.brandRepository.findManyByCodes(codes);

        const resolved: Set<string> = new Set(
            brands.map((brand) => brand.code),
        );

        const unknown: string[] = codes.filter((code) => !resolved.has(code));

        if (unknown.length > 0) {
            throw new NotFoundException(
                `Unknown brand code(s): ${unknown.join(', ')}`,
            );
        }

        return brands;
    }

    async grantRolesToStaff(
        userPublicId: string,
        payload: GrantStaffRolesDto,
    ): Promise<{ publicId: string; roles: StaffRole[] }> {
        const user: User | null =
            await this.userRepository.findByPublicId(userPublicId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.userType !== UserType.STAFF) {
            throw new BadRequestException(
                'Staff roles apply to staff accounts only',
            );
        }

        await this.userStaffRepository.createMany(
            payload.roles.map((role) => ({ userId: user.id, role })),
            this.prisma,
        );

        return {
            publicId: user.publicId,
            roles: await this.userStaffRepository.findRolesByUserId(user.id),
        };
    }

    async grantBrandAccessToStaff(
        userPublicId: string,
        payload: GrantBrandAccessDto,
    ): Promise<{ publicId: string; brands: string[] }> {
        const user: User | null =
            await this.userRepository.findByPublicId(userPublicId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.userType !== UserType.STAFF) {
            throw new BadRequestException(
                'Brand access applies to staff accounts only',
            );
        }

        const brands: Brand[] = await this.resolveBrandsByCode(
            payload.brandCodes,
        );

        await this.userBrandAccessRepository.createMany(
            brands.map((brand) => ({ userId: user.id, brandId: brand.id })),
            this.prisma,
        );

        return {
            publicId: user.publicId,
            brands: await this.userBrandAccessRepository.findBrandCodesByUserId(
                user.id,
            ),
        };
    }

    async createStaff(payload: CreateStaffDto): Promise<StaffAccount> {
        const existing: User | null = await this.userRepository.findByEmail(
            payload.email,
        );

        if (existing) {
            throw new ConflictException(
                'An account with this email already exists',
            );
        }

        const passwordHash = await this.hashService.hash(
            randomBytes(32).toString('hex'),
        );

        const brands: Brand[] = await this.resolveBrandsByCode(
            payload.brandCodes,
        );

        const invite: IssuedAccessToken = this.accessTokenService.issue();

        try {
            const staffAccount = await this.prisma.$transaction(async (tx) => {
                const staff: User = await this.userRepository.create(
                    {
                        fullName: payload.fullName,
                        email: payload.email,
                        phone: payload.phone,
                        passwordHash,
                        userType: UserType.STAFF,
                        status: UserStatus.UNACTIVATED,
                    },
                    tx,
                );

                await this.userStaffRepository.createMany(
                    payload.roles.map((role) => ({ userId: staff.id, role })),
                    tx,
                );

                await this.accessTokenRepository.create(
                    {
                        tokenHash: invite.tokenHash,
                        purpose: TokenPurpose.ACTIVATION,
                        expiresAt: invite.expiresAt,
                        user: { connect: { id: staff.id } },
                    },
                    tx,
                );

                if (brands.length > 0) {
                    await this.userBrandAccessRepository.createMany(
                        brands.map((brand) => ({
                            userId: staff.id,
                            brandId: brand.id,
                        })),
                        tx,
                    );
                }

                return {
                    id: staff.id,
                    publicId: staff.publicId,
                    fullName: staff.fullName,
                    email: staff.email,
                    phone: staff.phone,
                    status: staff.status,
                    roles: payload.roles,
                    brands: brands.map((brand) => brand.code),
                    activationUrl: this.accessTokenService.buildActivationUrl(
                        invite.token,
                    ),
                    activationExpiresAt: invite.expiresAt,
                };
            });

            await this.accountActivationNotificationProducer.enqueue({
                recipientUserId: staffAccount.id,
                brandId: brands.length === 1 ? brands[0].id : undefined,
                recipientEmail: staffAccount.email,
                recipientName: staffAccount.fullName,
                subject: 'Activate your InterviewCall account',
                channels: ['EMAIL'],
                templateKeys: {
                    EMAIL: 'AccountActivation',
                },
                data: {
                    recipientName: staffAccount.fullName,
                    activationUrl: staffAccount.activationUrl,
                },
            });

            return staffAccount;

        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'An account with this email already exists',
                );
            }

            throw error;
        }
    }
}
