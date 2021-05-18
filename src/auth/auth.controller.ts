import {
    Body,
    Controller, Get, HttpStatus, Logger, Param, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {UserService} from "./user/user.service";
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import {CreateAppUserDto, CreateB2BUserDto} from "../model/user.schema";
import {IResponse} from "../interfaces";


@ApiTags('auth')
@Controller('auth')
export class AuthController {

    private logger = new Logger('AuthController');

    constructor(private readonly userService: UserService,
                private readonly authService: AuthService
    ) {
    }

    @Post('/register')
    public async registerUser(@Res() res, @Body() createUserDto: CreateAppUserDto | CreateB2BUserDto): Promise<any> {
        this.logger.log("**Register User Request**")
        const result = await this.authService.registerUser(createUserDto);
        return res.status(HttpStatus.OK).json(result);
    }

    @Post('login')
    public async login(@Res() res, @Body() login): Promise<IResponse> {
        this.logger.log("**Login Request**")
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const userDocument = await this.userService.findByUsername(login.username);
        if (userDocument) {
            if (userDocument.status != "active") {
                result.data.message = "Please verify first your mail";
                this.logger.log("User login failed! User has to confirm his mail first.")
                result.success = false;
                return res.status(HttpStatus.OK).json(result);
            } else {
                const success = await this.authService.validateUserWithPassword(userDocument, login.password);
                if (success) {
                    const token = this.authService.createToken(userDocument);
                    this.logger.log("User  succesfully logged in!")
                    result.data = token;
                    result.success = true;
                    res.cookie('accessToken', token, {maxAge: 360000, httpOnly: true, secure: true});
                    return res.status(HttpStatus.OK).json(result);
                } else {
                    result.status = 401;
                    result.data.message = "Username or Password wrong!";
                    return res.status(HttpStatus.OK).json(result);
                }
            }
        } else {
            result.data.message = "Username or Password Wrong!";
            result.status = HttpStatus.UNAUTHORIZED
            this.logger.log("Username or Password Wrong!")
            result.success = false;
            return res.status(HttpStatus.OK).json(result);
        }

    }


    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() req) {
        return req.user;
    }

    @Get('/:user/:code')
    async verifyAccount(@Param('user') userID: string, @Param('code') code: string, @Res() res) {
        const result = await this.authService.verifyAccount(userID, code);
        return res.status(HttpStatus.OK).json(result);
    }


}
