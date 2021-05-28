import {PassportStrategy} from '@nestjs/passport';
import {HttpStatus, Injectable} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Strategy} from "passport-local";
import {APIResponse} from "../interfaces";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly authService: AuthService) {
        super({usernameField: 'username', passwordField: 'password'});
    }

    async validate(username: string, password: string): Promise<APIResponse> {
        const success = await this.authService.validateUsernameWithPassword(username, password);
        if (!success) {
            return APIResponse.errorResponse(HttpStatus.UNAUTHORIZED)
        } else {
            return APIResponse.successResponse(undefined);
        }

    }
}
