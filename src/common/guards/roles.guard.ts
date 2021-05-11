import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const hasRole = () =>
            !!user.roles.find(role => !!roles.find(item => item === role));

        return user && user.roles && hasRole();
    }
}
