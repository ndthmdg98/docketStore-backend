import { SetMetadata } from '@nestjs/common';

export enum Role {
    B2B_USER = 'b2b_user',
    APP_USER = 'app_user',
    MODERATOR = 'MODERATOR',
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
