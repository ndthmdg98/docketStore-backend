import {PassportStrategy} from '@nestjs/passport';
import {HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportLocalModel} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {AuthService} from "./auth.service";
import {Strategy} from "passport-local";
import {User, UserDocument} from "../model/user.schema";
import {IResponse} from "./interfaces";
import {UserService} from "./user/user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {
        super({
            usernameField: 'username',
            passwordField: 'password'
        });

    }

    async validate(username: string, password: string): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const user = await this.userService.findByUsername(username);
        const success = await this.authService.validateUserWithPassword(user, password);
        if (!success) {
            result.data.message = "Username or password wrong";
            result.status = HttpStatus.UNAUTHORIZED;
            return result;
        } else {
            result.success = true;
            result.data.user = user;
            return result;
        }

    }
}
