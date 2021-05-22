import {PassportStrategy} from '@nestjs/passport';
import {HttpStatus, Injectable} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Strategy} from "passport-local";
import {APIResponse} from "../interfaces";
import {UserService} from "./user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {
        super({
            usernameField: 'username',
            passwordField: 'password'
        });

    }

    async validate(username: string, password: string): Promise<APIResponse> {
        const user = await this.userService.findByUsername(username);
        const success = await this.authService.validateUserWithPassword(user, password);
        if (!success) {
            return APIResponse.errorResponse(HttpStatus.UNAUTHORIZED)
        } else {
            return APIResponse.successResponse(undefined);
        }

    }
}
