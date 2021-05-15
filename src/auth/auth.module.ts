import {
    DynamicModule,
    Inject,
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
import {UserModule} from "./user/user.module";
import {MulterModule} from "@nestjs/platform-express";
import {TagSchema} from "../model/tag.schema";
import {TagService} from "../api/tag/tag.service";
import {TagModule} from "../api/tag/tag.module";
import {MailSchema} from "../model/mail.schema";
import {MailerModule} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import {MailService} from "./mail.service";
import {APP_DI_CONFIG, AppConfig} from "../app.module";


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
        TagModule,
        UserModule,
        PassportModule,
        MongooseModule.forFeature([{name: 'Users', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Tags', schema: TagSchema}]),
        MongooseModule.forFeature([{name: 'Mail', schema: MailSchema}]),
        MulterModule.register({
            dest: './uploads',
        }),
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
        LocalStrategy,
        JwtStrategy,
        TagService,
        MailService,
        {
            provide: 'JWT_CONFIG',
            useValue: JWT_DI_CONFIG
        },
        {
            provide: 'MAIL_CONFIG',
            useValue: MAIL_DI_CONFIG
        }
    ],
    exports: [
        AuthService,
        MongooseModule.forFeature([{name: 'Users', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Tags', schema: TagSchema}])
    ],

})
export class AuthModule {
    static forRoot(appConfig: AppConfig): DynamicModule {
        return {
            module: AuthModule,
            providers: [ {
                provide: 'APP_CONFIG',
                useValue: appConfig
            }],
            exports: [ {
                provide: 'APP_CONFIG',
                useValue: appConfig
            },],
        };
    }
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
}

