import {HttpStatus, Injectable} from '@nestjs/common';
import {AuthenticationResult, PassportLocalModel, Schema} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {debug} from 'console';
import * as jwt from "jsonwebtoken";
import {MailService} from "./mail/mail.service";
import {UserService} from "./user/user.service";
import {IContactInformation, IUser, User, UserDocument} from "../model/user.schema";
import {MailVerificationDto} from "../model/mail.schema";
import {JwtConfig} from "../shared/config";
import {CreateAppUserDto, CreateB2BUserDto, IResponse, IToken, JwtPayloadInterface} from "./interfaces";
import {TagService} from "../api/tag/tag.service";
import * as fs from "fs";


export interface IAuthService {
    registerB2bUser(userToRegister: CreateB2BUserDto): Promise<IResponse>;

    registerAppUser(userToRegister: CreateAppUserDto): Promise<IResponse>;

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
    ) {

    }

    async registerAppUser(userToRegister: CreateAppUserDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {message: ""}
        }
        const user = await this.userService.findOne({email: userToRegister.username});
        if (user) {
            result.status = HttpStatus.BAD_REQUEST
            result.data.message = "User with given e-mail already registered";
        } else {
            const user = await this.userModel.register(new this.userModel(
                {
                    username: userToRegister.username,
                    email: userToRegister.username,
                    contact: userToRegister.contact,
                    status: "pending",
                    roles: ['app_user'],
                    // @ts-ignore
                    lastLogin: new Date()
                }), userToRegister.password);
            if (user.errors) {
                result.data.message = user.errors;
            } else if (user) {
                const created_user = await this.userService.findById(user.id);
                let mailVerificationDto: MailVerificationDto = {
                    receiver: created_user,
                    code: this.mailService.generateCode(10),
                    dateCreated: new Date()
                };
                result.success = await this.mailService.create(mailVerificationDto);
                result.data.message = "User successfully created!"
            }
        }
        return result;
    }

    async registerB2bUser(userToRegister: CreateB2BUserDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {message: ""}
        }
        const user = await this.userService.findOne({email: userToRegister.username});
        if (user) {
            result.data.message = "User with given e-mail already registered";
        } else {
            const user = await this.userModel.register(new this.userModel(
                {
                    username: userToRegister.username,
                    email: userToRegister.username,
                    contact: userToRegister.contact,
                    company: userToRegister.company,
                    status: "pending",
                    roles: ['b2b_user'],
                    lastLogin: new Date()
                }), userToRegister.password);
            if (user.errors) {
                result.data.message = user.errors;
            } else if (user) {
                const created_user = await this.userService.findById(user.id);
                let mailVerificationDto: MailVerificationDto = {
                    receiver: created_user,
                    code: this.mailService.generateCode(10),
                    dateCreated: new Date()
                };
                result.success = await this.mailService.create(mailVerificationDto);
                result.data.message = "User successfully created!"
            }
        }
        return result;
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

    async verifyAccount(userID: string, code: string): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: true,
            data: {message: "Your mail was succesfully accepted;"}
        }
        const user = await this.userService.findById(userID);
        if (user) {
            const mailVerification = await this.mailService.findOne({receiver: user});
            if (mailVerification.receiver.equals(user)) {
                const valuesToUpdate = {status: 'active'};
                await this.userService.updateByID(userID, valuesToUpdate);
            } else {
                result.success = false;
                result.status = HttpStatus.BAD_REQUEST;
                result.data.message = "Code and user missmatch";
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
        const firstName = user.contact.firstName;
        const lastName = user.contact.lastName;
        const accessToken = jwt.sign({
            id: user._id,
            username: user.username,
            firstName: user.contact.firstName,
            lastName: user.contact.lastName
        }, JwtConfig.jwtSecret, {expiresIn});
        return {
            expiresIn,
            accessToken,
        };
    }

    createStorageForUser(userID: string) {
        var dir = `./uploads/${userID}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    async createDefaultDocumentsForUser(userID: string) {
        this.createStorageForUser(userID);
        await this.userService.findById(userID).then(async user => {
            await this.tagService.createStandardTags(user);
        })

    }


}




