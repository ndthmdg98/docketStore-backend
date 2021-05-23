import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {UserService} from "./user.service";
import {MailVerificationService} from "./mail-verification.service";
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "../model/user.schema";
import {MailSchema} from "../model/mail.schema";
import {DATABASE_URL_TEST} from "../app.module";
import {JWT_DI_CONFIG, MAIL_DI_CONFIG} from "./auth.module";

describe('Auth Controller', () => {
    let controller;
    let userService;
    let mailService;
    let authService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(DATABASE_URL_TEST),
                MongooseModule.forFeature([{name: 'Users', schema: UserSchema}]),
                MongooseModule.forFeature([{name: 'Mails', schema: MailSchema}]),
            ],
            controllers: [AuthController],
            providers: [AuthService, UserService, MailVerificationService,
                {
                    provide: 'JWT_CONFIG',
                    useValue: JWT_DI_CONFIG
                },
                {
                    provide: 'MAIL_CONFIG',
                    useValue: MAIL_DI_CONFIG
                },
                {
                    provide: 'MailerService',
                    useValue: MAIL_DI_CONFIG
                }

            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        userService = module.get<UserService>(UserService);
        authService = module.get<AuthService>(AuthService);
        mailService = module.get<MailVerificationService>(MailVerificationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(authService).toBeDefined();
        expect(mailService).toBeDefined();
        expect(userService).toBeDefined();
    });
});
