import {Inject, Injectable, Logger} from '@nestjs/common';
import {AuthenticationResult} from 'mongoose';
import * as jwt from "jsonwebtoken";
import {User} from "../model/user.schema";
import {JwtConfig} from "./auth.module";
import {MailVerificationService} from "./mail-verification.service";
import {UserService} from "./user.service";
import {IToken, JwtPayloadInterface} from "../interfaces";


@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');

    constructor(
        private readonly mailService: MailVerificationService,
        private readonly userService: UserService,
        @Inject("JWT_CONFIG") private readonly JWT_CONFIG: JwtConfig
    ) {
    }




    async verifyAccount(userId: string, code: string): Promise<boolean> {
        const mailVerification = await this.mailService.findOne({receiverId: userId});
        if (mailVerification) {
            if (mailVerification.receiverId === userId && mailVerification.code === code) {
                return await this.userService.activateUser(userId);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    createToken(jwtPayloadInterface: JwtPayloadInterface): IToken {
        const expiresIn = 3600;
        const accessToken = jwt.sign({
            id: jwtPayloadInterface.id,
            username: jwtPayloadInterface.username,
            firstName: jwtPayloadInterface.firstName,
            lastName: jwtPayloadInterface.lastName
        }, this.JWT_CONFIG.jwtSecret, {expiresIn});
        return {
            expiresIn,
            accessToken,
        };
    }

    createJwtPayload(userDocument): JwtPayloadInterface {
        return {
            firstName: userDocument.firstName,
            lastName: userDocument.lastName,
            id: userDocument._id,
            username: userDocument.username
        }
    }

    async validateJwtToken(payload: JwtPayloadInterface): Promise<User> {
        return await this.userService.findById(payload.id);
    }

    async validateUsernameWithPassword(username: string, pasword: string): Promise<boolean> {
        const user = await this.userService.findByUsername(username);
        const authenticationResult: AuthenticationResult = await user.authenticate(pasword);
        if (authenticationResult.error) {
            return false;
        } else if (authenticationResult.user) {
            return true;
        }
    }
}




