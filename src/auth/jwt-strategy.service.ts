import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractStrategy, AuthGuard, PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from "passport-jwt";
import {JwtPayloadInterface} from "./interfaces";
import {AuthService} from "./auth.service";
import {JwtConfig} from "./auth.module";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, @Inject("JWT_CONFIG") private readonly JWT_CONFIG: JwtConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_CONFIG.jwtSecret,
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayloadInterface): Promise<any> {
        console.log("jwt validation: search user")
        const user = await this.authService.validateUser(payload);
        if (!user) {
            console.log("validation failed: user not found")
            new UnauthorizedException()
        }
        else {
            console.log("jwt validation: found user")
            return user;
        }
    }

}
