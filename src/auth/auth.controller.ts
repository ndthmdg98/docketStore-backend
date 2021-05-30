import {
    Body,
    Controller, Get, HttpStatus, Logger, Param, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import {UserService} from "./user.service";
import {MailVerificationService} from "./mail-verification.service";
import {APIResponse} from "../interfaces";
import {MailService} from "../common/mail.service";
import {CreateAppUserDto, CreateB2BUserDto, LoginUserDto} from "../dto/auth.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";



@ApiTags('auth')
@Controller('auth')
export class AuthController {

    private logger = new Logger('AuthController');

    constructor(private readonly userService: UserService,
                private readonly authService: AuthService,
                private readonly mailVerificationService: MailVerificationService,
                private readonly mailService: MailService
    ) {
    }

    @Post("/app/register")
    public async registerAppUser(@Res() res, @Body() createUserDto: CreateAppUserDto): Promise<any> {
        const userExists = await this.userService.findByUsername(createUserDto.username)
        if (userExists) {
            return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST, "User with Given Mail already exists"));
        } else {
            const user = await this.userService.createUser(createUserDto);
            if (user) {
                return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                //TODO Dies ist für die Mailbestätigung notwendig
                //const mailVerification = await this.mailVerificationService.create(user._id);
                // if (mailVerification) {
                //     const sentMail = await this.mailService.sendWelcomeEmail(user._id, user.username, user.firstName, mailVerification.code);
                //     if (sentMail) {
                //         return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                //     }
                // } else {
                //     return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                // }
            } else {
                return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }
    }

    @Post("/b2b/register")
    public async registerB2bUser(@Res() res, @Body() createUserDto: CreateB2BUserDto): Promise<any> {
        const userExists = await this.userService.findByUsername(createUserDto.username)
        if (userExists) {
            return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST, "User with Given Mail already exists"));
        } else {
            const user = await this.userService.createUser(createUserDto);
            if (user) {
                return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                //TODO Dies ist für die Mailbestätigung notwendig
               /* const mailVerification = await this.mailVerificationService.create(user._id);
                if (mailVerification) {
                    const sentMail = await this.mailService.sendWelcomeEmail(user._id, user.username, user.firstName, mailVerification.code);
                    if (sentMail) {
                        return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                    }
                } else {
                    return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                }*/
            } else {
                return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }
    }


    @Post('/login')
    public async login(@Res() res, @Body() loginDto: LoginUserDto): Promise<APIResponse> {
        this.logger.log("**Login Request**")
        const userDocument = await this.userService.findByUsername(loginDto.username)
        if (!userDocument) {
            return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED));
        }
        if (!await this.userService.isUserActive(userDocument._id)) {
            return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED));
        } else {
            const success = await this.authService.validateUsernameWithPassword(loginDto.username, loginDto.password);
            if (success) {
                const token = this.authService.createToken(this.authService.createJwtPayload(userDocument));
                res.cookie('accessToken', token, {maxAge: 360000, httpOnly: true, secure: true});
                return res.status(HttpStatus.OK).json(APIResponse.successResponse(token));
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED));
            }
        }

    }

    @Get('/:user/:code')
    async verifyAccount(@Req() req, @Res() res, @Param('user') userID: string, @Param('code') code: string) {
        const userDocument = await this.userService.findById(userID);
        if (await this.userService.isUserActive(userDocument._id)) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse("Given Mail already confirmed!"));
        } else {
            const success = await this.mailVerificationService.verifyMailVerification(userID, code);
            if (success) {
                await this.userService.activateUser(userID);
                return res.status(HttpStatus.OK).json(APIResponse.successResponse("Mail confirmed! Account successfully activated."));
            } else {
                return res.status(HttpStatus.OK).json(APIResponse.errorResponse(500));
            }
        }
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(APIResponse.successResponse(req.user));
    }
}
