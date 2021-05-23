import {
    Body,
    Controller, Get, HttpStatus, Inject, Logger, Param, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import {CreateAppUserDto, CreateB2BUserDto, User} from "../model/user.schema";
import {UserService} from "./user.service";
import {MailVerificationService} from "./mail-verification.service";
import {APIResponse} from "../interfaces";
import {MailService} from "../common/mail.service";


@ApiTags('auth')
@Controller('auth')
export class AuthController {

    private logger = new Logger('AuthController');

    constructor( private readonly userService: UserService,
                 private readonly authService: AuthService,
                  private readonly mailVerificationService: MailVerificationService,
                  private readonly mailService: MailService
    ) {
    }

    @Post('/register')
    public async registerUser(@Res() res, @Body() createUserDto: CreateAppUserDto | CreateB2BUserDto): Promise<any> {

        const userExists = await this.userService.existsUsername(createUserDto.username)
        if (userExists) {
            return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST));
        } else {
            const user = await this.authService.registerUser(createUserDto);
            if (user) {
                const mailVerification = await this.mailVerificationService.create(user._id);
                if (mailVerification) {
                    const sentMail = await this.mailService.sendWelcomeEmail(user._id, user.username, user.firstName, mailVerification.code);
                    if (sentMail) {
                        return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                    }
                } else {
                    return res.status(HttpStatus.OK).json(APIResponse.successResponse(user._id))
                }
            } else {
                return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }
    }

    s

    @Post('login')
    public async login(@Res() res, @Body() login): Promise<APIResponse> {
        this.logger.log("**Login Request**")
        const userDocument = await this.userService.findByUsername(login.username)
        if (!userDocument) {
            return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED))
        } else {
            if (!await this.userService.isUserActive(userDocument._id)) {
                return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED));
            } else {
                const success = await this.authService.validateUserWithPassword(userDocument, login.password);
                if (success) {
                    const token = this.authService.createToken(this.authService.createJwtPayload(userDocument));
                    res.cookie('accessToken', token, {maxAge: 360000, httpOnly: true, secure: true});
                    return res.status(HttpStatus.OK).json(APIResponse.successResponse(token));
                } else {
                    return res.status(HttpStatus.UNAUTHORIZED).json(APIResponse.errorResponse(HttpStatus.UNAUTHORIZED));
                }
            }
        }

    }

    @Post('/:user/:code')
    async verifyAccount(@Req() req, @Param('user') userID: string, @Param('code') code: string, @Res() res) {
        const userDocument = await this.userService.findById(userID);
        if (await this.userService.isUserActive(userDocument._id)) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse({message: "Given Mail already confirmed!"}));
        } else {
            const success = await this.authService.verifyAccount(userID, code);
            if (success) {
                return res.status(HttpStatus.OK).json(APIResponse.successResponse(null));
            } else {
                return res.status(HttpStatus.OK).json(APIResponse.errorResponse(500));
            }
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() req, @Res() res)  {
        return res.status(HttpStatus.OK).json(APIResponse.successResponse(req.user)) ;
    }
}
