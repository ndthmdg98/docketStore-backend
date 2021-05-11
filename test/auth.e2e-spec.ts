import {AuthController} from "../src/auth/auth.controller";
import {AuthService} from "../src/auth/auth.service";
import {MailService} from "../src/auth/mail/mail.service";
import {UserService} from "../src/auth/user/user.service";
import {PassportLocalModel} from "mongoose";
import {
    CreateAppUserDto,
    User,
    UserDocument
} from "../src/model/user.schema";
import {Test, TestingModule} from "@nestjs/testing";
import {LocalStrategy} from "../src/auth/local.strategy";
import {JwtStrategy} from "../src/auth/jwt-strategy.service";

import * as request from 'supertest';
import {AuthModule} from "../src/auth/auth.module";

let appUser: User = {
    company: null,
    contact: {
        firstName: "Nico",
        lastName: "Diefenbacher",
        phoneNumber: "018328138",
        contactEmail: "nicodiefenbacher@web.de"
    },
    email: "username",
    lastLogin: new Date(),
    password: "password",
    roles: ["b2b_user"],
    status: "pending",
    username: "username"
}

let createAppUserDto: CreateAppUserDto =  {
    username: "username",
    password: "password",
    contact: {
        firstName: "Nico",
        lastName: "Diefenbacher",
        phoneNumber: "018328138",
        contactEmail: "nicodiefenbacher@web.de"
    }
}

describe('AuthModule', () => {
    let app: TestingModule;
    let mailService: MailService;
    let userService: UserService;
    let userModel: PassportLocalModel<UserDocument>;

    let authService = new AuthService(mailService,userService,userModel);

    beforeAll(async () => {

        app = await Test.createTestingModule({
            providers: [AuthService, LocalStrategy, JwtStrategy],
            controllers: [AuthController]
        }).compile();
        authService = app.get<AuthService>(AuthService);
    });

    describe('create app user', () => {
        it('should create app user', async () => {
           await authService.registerAppUser(createAppUserDto)


        });
    });
});


    it(`/POST create app user`, async () => {
        return request(app.getHttpServer())
            .get('/auth/app/register')
            .expect(200)
            .expect({
                data: await authService.registerAppUser(),
            });
    });

    afterAll(async () => {
        await app.close();
    });
});










describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let mailService: MailService;
    let userService: UserService;
    let userModel: PassportLocalModel<UserDocument>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, LocalStrategy, JwtStrategy],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        authController = moduleRef.get<AuthController>(AuthController);
    });

    describe('registerAppUser', () => {
        it('should register an app user', async () => {
            const result = ['test'];
            jest.spyOn(authService, 'registerAppUser').mockImplementation(() => result);

            expect(await authController.registerAppUser(new Response, )).toBe(result);
        });
    });
});
