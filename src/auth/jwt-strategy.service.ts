import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractStrategy, AuthGuard, PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from "passport-jwt";
import {AuthService} from "./auth.service";
import {JwtConfig} from "../shared/config";
import {JwtPayloadInterface} from "./interfaces";

//const PassportJwtStrategy: new(...args) => AbstractStrategy & Strategy = PassportStrategy(Strategy);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JwtConfig.jwtSecret,
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
