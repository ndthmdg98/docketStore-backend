import {Inject, Injectable, Logger} from '@nestjs/common';
import {AuthenticationResult, PassportLocalModel} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import * as jwt from "jsonwebtoken";
import {CreateAppUserDto, CreateB2BUserDto, User, UserDocument} from "../model/user.schema";
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
        @InjectModel('Users') private readonly userModel: PassportLocalModel<UserDocument>,
        @Inject("JWT_CONFIG") private readonly JWT_CONFIG: JwtConfig
    ) {
    }

    async registerUser(userToRegister: CreateAppUserDto | CreateB2BUserDto): Promise<any> {
        const user = await this.userService.createUser(userToRegister);
        if (user && user._id) {
            this.logger.log("User successfully created!");
            return user;
        } else {
            this.logger.log(user.errors);

            return null;
        }
    }


    private async checkPassword(user: UserDocument, password: string): Promise<boolean> {
        const authenticationResult: AuthenticationResult = await user.authenticate(password);
        if (authenticationResult.error) {
            return false;
        } else if (authenticationResult.user) {
            return true;
        }
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

    async validateUserWithPassword(user: UserDocument, pass: string): Promise<boolean> {
        return await this.checkPassword(user, pass);
    }
}




