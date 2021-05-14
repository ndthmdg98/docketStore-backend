import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import {AuthenticationResult, PassportLocalModel, Schema} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import * as jwt from "jsonwebtoken";
import {MailService} from "./mail/mail.service";
import {UserService} from "./user/user.service";
import {User, UserDocument} from "../model/user.schema";
import {MailVerificationDto} from "../model/mail.schema";
import {CreateAppUserDto, CreateB2BUserDto, IResponse, IToken, JwtPayloadInterface} from "./interfaces";
import {TagService} from "../api/tag/tag.service";
import {JwtConfig} from "./auth.module";


export interface IAuthService {
    registerUser(userToRegister: CreateAppUserDto | CreateB2BUserDto): Promise<IResponse>;

    validateUser(payload: JwtPayloadInterface): Promise<User>;

    validateUserWithUsernameAndPassword(username: string, pass: string): Promise<IResponse>;

    verifyAccount(userID: string, code: string): Promise<IResponse>;
}

@Injectable()
export class AuthService implements IAuthService {

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
            result.status = HttpStatus.BAD_REQUEST
            result.data.message = "User with given e-mail already registered";
            return result;
        } else {
            const user = await this.userService.createUser(userToRegister);
            if (user.errors) {
                result.data.message = "User could not be created!";
                result.status = HttpStatus.INTERNAL_SERVER_ERROR
                return result;
            } else if (user) {
                const created_user = await this.userService.findById(user.id);
                let mailVerificationDto: MailVerificationDto = {
                    receiverId: created_user._id,
                    code: this.mailService.generateCode(10),
                    dateCreated: new Date()
                };
                const mailVerification = await this.mailService.create(mailVerificationDto);
                if (mailVerification.errors) {
                    result.data.message = "Mail verification could not be created!";
                    result.status = HttpStatus.INTERNAL_SERVER_ERROR
                    return result;
                } else if (mailVerification) {
                    const sentMail = await this.mailService.sendWelcomeEmail(user._id, user.username, user.contact.firstName, mailVerificationDto.code);
                    if (sentMail) {
                        result.data.message = "User successfully created! Please check your Mails"
                        result.success = true;
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


    async validateUser(payload: JwtPayloadInterface): Promise<User> {
        console.log(payload);
        return await this.userService.findById(payload.id);
    }

    async validateUserWithUsernameAndPassword(username: string, pass: string): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const user = await this.userService.findOne({username: username});
        if (user) {
            const authenticationResult: AuthenticationResult = await user.authenticate(pass);
            console.log(authenticationResult.error)
            if (authenticationResult.error) {
                result.status = HttpStatus.UNAUTHORIZED;
                result.data.message = "Username or Password wrong!";
                return result
            } else if (authenticationResult.user) {
                if ("status" in authenticationResult.user && authenticationResult.user.status == "pending") {
                    result.data.message = "Please verify first your mail";
                    result.success = false;
                    return result;
                } else {
                    const {password, ...response} = authenticationResult.user.toObject({getters: true})
                    result.data = response;
                    result.success = true;
                    return result;
                }
            } else {
                result.status = HttpStatus.UNAUTHORIZED;
                result.data.message = "Username or Password wrong!";
                return result;
            }
        } else {
            result.status = HttpStatus.UNAUTHORIZED;
            result.data.message = "Username or Password wrong!";
            return result
        }
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




