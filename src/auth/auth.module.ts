import {
    Module,
} from '@nestjs/common';

import {MongooseModule} from "@nestjs/mongoose";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {UserSchema} from "../model/user.schema";
import {LocalStrategy} from "./local.strategy";
import {JwtStrategy} from "./jwt-strategy.service";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {MailSchema} from "../model/mail.schema";
import {MailerModule} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import {MailVerificationService} from "./mail-verification.service";
import {DocketModule} from "../api/docket/docket.module";
import {UserService} from "./user.service";
import {MailService} from "../common/mail.service";
import {CodeGeneratorService} from "./code-generator.service";


export const JWT_DI_CONFIG: JwtConfig = {
    jwtSecret: "ILovePokemon",
    expiresIn: "1h"
};


export const MAIL_DI_CONFIG: MailConfig = {
    hostname: "smtp.strato.de",
    port: 465,
    username: process.env["STRATO_MAIL_USERNAME"],
    password: process.env["STRATO_MAIL_PASSWORD"],
    senderDisplayHostname: "service@ndfnb.de",
    authenticationHostname: "http://localhost:3000/auth"
};

@Module({
    imports: [
        PassportModule,
        DocketModule,
        MongooseModule.forFeature([{name: 'Users', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Mails', schema: MailSchema}]),
        JwtModule.register({
            secret: JWT_DI_CONFIG.jwtSecret,
            signOptions: {expiresIn: JWT_DI_CONFIG.expiresIn},
        }),
        MailerModule.forRoot({
            transport: {
                host: MAIL_DI_CONFIG.hostname,
                ignoreTLS: true,
                port: MAIL_DI_CONFIG.port,
                secure: true,
                auth: {
                    user: MAIL_DI_CONFIG.username,
                    pass: MAIL_DI_CONFIG.password,
                },
                tls: {
                    ciphers: 'SSLv3',
                    rejectUnauthorized: false
                },
                protocol: 'smtps',

                defaults: {
                    from: MAIL_DI_CONFIG.senderDisplayHostname,
                },
                template: {
                    dir: process.cwd() + '/templates/',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        LocalStrategy,
        JwtStrategy,
        MailVerificationService,
        MailService,
        CodeGeneratorService,
        {
            provide: 'JWT_CONFIG',
            useValue: JWT_DI_CONFIG
        },
        {
            provide: 'MAIL_CONFIG',
            useValue: MAIL_DI_CONFIG
        }
    ],
    exports: [],

})
export class AuthModule {

}


export class JwtConfig {
    jwtSecret: string;
    expiresIn: string;
}



export class MailConfig {
    hostname: string;
    port: number;
    username: string;
    password: string;
    senderDisplayHostname: string;
    authenticationHostname: string;


    constructor(hostname: string, port: number, username: string, password: string, senderDisplayHostname: string, authenticationHostname: string) {
        this.hostname = hostname;
        this.port = port;
        this.username = username;
        this.password = password;
        this.senderDisplayHostname = senderDisplayHostname;
        this.authenticationHostname = authenticationHostname;
    }
}

