import {
    Body,
    Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {UserService} from "./user/user.service";
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import * as passport from "passport";
import {User, UserDocument} from "../model/user.schema";
import {CreateAppUserDto, CreateB2BUserDto, IResponse, IToken} from "./interfaces";


export interface IAuthController {

    registerUser(res, createUserDto: CreateAppUserDto | CreateB2BUserDto): Promise<any>;

    login(res, login: { username: string, password: string }): Promise<any>;

    verifyAccount(req, userID: string, code: string);

}


@ApiTags('auth')
@Controller('auth')
export class AuthController implements IAuthController {


    constructor(private readonly userService: UserService,
                private readonly authService: AuthService
    ) {
    }

    @Post('/register')
    public async registerUser(@Res() res, @Body() createUserDto: CreateAppUserDto | CreateB2BUserDto): Promise<any> {
        const result = await this.authService.registerUser(createUserDto);
        return res.status(HttpStatus.OK).json(result);


    }

    @Post('login')
    public async login(@Res() res, @Body() login): Promise<IResponse> {
        const result = await this.authService.validateUserWithUsernameAndPassword(login.username, login.password);
        if (result.success) {
            const user: UserDocument = result.data;
            // passport.serializeUser(function (user: UserDocument, done) {
            //     done(null, user._id);
            // });
            const token = this.authService.createToken(user);
            result.data = token;
            res.cookie('accessToken', token, {maxAge: 360000, httpOnly: true, secure: true});
            return res.status(HttpStatus.OK).json(result);
        } else {
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
