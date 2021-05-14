import {DynamicModule, Module} from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {MailController} from './mail.controller';
import {MailService} from "./mail.service";
import {MongooseModule} from "@nestjs/mongoose";
import {MailSchema} from "../../model/mail.schema";
import {AppConfigModule} from "../../app-config.module";




export class MailConfig {
    hostname: string;
    port: number;
    username: string;
    password: string;
    sender: string;
}

export const MAIL_DI_CONFIG: MailConfig = {
        hostname: "smtp.strato.de",
        port: 465,
        username: process.env["STRATO_MAIL_USERNAME"],
        password: process.env["STRATO_MAIL_PASSWORD"],
        sender: "service@ndfnb.de"
    };

@Module({
    imports: [
        AppConfigModule,
        MongooseModule.forFeature([{name: 'Mail', schema: MailSchema}]),
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
                    from: MAIL_DI_CONFIG.sender,
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
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {

}
