import {HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {AuthenticationResult, PassportLocalModel} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import * as jwt from "jsonwebtoken";
import {UserService} from "./user/user.service";
import {User, UserDocument} from "../model/user.schema";
import {MailVerificationDto} from "../model/mail.schema";
import {CreateAppUserDto, CreateB2BUserDto, IResponse, IToken, JwtPayloadInterface} from "./interfaces";
import {TagService} from "../api/tag/tag.service";
import {JwtConfig} from "./auth.module";
import {MailService} from "./mail.service";
import * as passport from "passport";


@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly tagService: TagService,
        @InjectModel('Users') private readonly userModel: PassportLocalModel<UserDocument>,
        @Inject("JWT_CONFIG") private readonly JWT_CONFIG: JwtConfig
    ) {
    }

    async registerUser(userToRegister: CreateAppUserDto | CreateB2BUserDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {message: ""}
        }
        const user = await this.userService.findOne({email: userToRegister.username});
        if (user) {
            const message = "User with given e-mail already registered!";
            result.status = HttpStatus.BAD_REQUEST
            result.data.message = message
            this.logger.log(message);
            return result;
        } else {
            const user = await this.userService.createUser(userToRegister);
            if (user.errors) {
                const message = "User could not be created!";
                result.status = HttpStatus.INTERNAL_SERVER_ERROR
                result.data.message = message;
                this.logger.log(message);
                return result;
            } else if (user && user._id) {
                this.logger.log("User successfully created!");
                let mailVerificationDto: MailVerificationDto = {
                    receiverId: user._id,
                    code: this.mailService.generateCode(10),
                    dateCreated: new Date()
                };
                const mailVerification = await this.mailService.create(mailVerificationDto);
                if (mailVerification.errors) {
                    result.data.message = "Mail verification could not be created!";
                    result.status = HttpStatus.INTERNAL_SERVER_ERROR
                    return result;
                } else if (mailVerification) {
                    this.logger.log("Mail Database Object successfully created!");
                    const sentMail = await this.mailService.sendWelcomeEmail(user._id, user.username, user.contact.firstName, mailVerificationDto.code);
                    if (sentMail) {
                        const message = "User successfully created! Please check your Mails"
                        result.success = true;
                        result.data.message = message;
                        return result;
                    } else {
                        result.data.message = "Mail could not successfully sent!"
                        result.success = false;
                        return result;
                    }
                } else {

                }
            }
        }

    }


    async checkPassword(user: UserDocument, password: string) {
        const authenticationResult: AuthenticationResult = await user.authenticate(password);
        if (authenticationResult.error) {
            this.logger.log("Username or Password Wrong!")
            return false;
        } else if (authenticationResult.user) {
            return true;
        }
    }


    login2() {
        passport.serializeUser(function (user: UserDocument, done) {
            done(null, user._id);
        });
    }

    async validateUser(payload: JwtPayloadInterface): Promise<User> {
        return await this.userService.findById(payload.id);
    }

    async validateUserWithPassword(user: UserDocument, pass: string): Promise<boolean> {
            const success = await this.checkPassword(user, pass);
            return success;
        }




    async verifyAccount(userId: string, code: string): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: true,
            data: {message: "Your mail was succesfully accepted;"}
        }
        const user = await this.userService.findById(userId);
        if (user) {
            const mailVerification = await this.mailService.findOne({receiverId: userId});
            if (mailVerification) {
                if (mailVerification.receiverId === userId) {
                    const valuesToUpdate = {status: 'active'};
                    await this.userService.updateByID(userId, valuesToUpdate);
                } else {
                    result.success = false;
                    result.status = HttpStatus.BAD_REQUEST;
                    result.data.message = "Error bad link";
                }
            }
        } else {
            result.success = false;
            result.status = HttpStatus.BAD_REQUEST;
            result.data.message = "Given user ID not found";

        }
        return result;
    }

    createToken(user: UserDocument): IToken {
        const expiresIn = 3600;
        const accessToken = jwt.sign({
            id: user._id,
            username: user.username,
            firstName: user.contact.firstName,
            lastName: user.contact.lastName
        }, this.JWT_CONFIG.jwtSecret, {expiresIn});
        return {
            expiresIn,
            accessToken,
        };
    }
}




