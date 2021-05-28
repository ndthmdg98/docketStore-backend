import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from "passport-jwt";
import {AuthService} from "./auth.service";
import {JwtConfig} from "./auth.module";
import {JwtPayloadInterface} from "../interfaces";


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
        const user = await this.authService.validateJwtToken(payload);
        if (!user) {
            new UnauthorizedException()
        }
        else {
            return user;
        }
    }

}
