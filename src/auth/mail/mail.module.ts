import {DynamicModule, Module} from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {MailController} from './mail.controller';
import {MailService} from "./mail.service";
import {MongooseModule} from "@nestjs/mongoose";
import {MailSchema} from "../../model/mail.schema";

export class MailConfig {

    public static hostname  = process.env["STRATO_MAIL_HOSTNAME"];
    public static port      = process.env["STRATO_MAIL_PORT"];
    public static username  = process.env["STRATO_MAIL_USERNAME"];
    public static password  = process.env["STRATO_MAIL_PASSWORD"];

}
@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Mail', schema: MailSchema}]),
        MailerModule.forRoot({
                transport: {
                    host: MailConfig.hostname,
                    ignoreTLS: true,
                    port: MailConfig.port,
                    secure: true,
                    auth: {
                        user: MailConfig.username,
                        pass: MailConfig.password,
                    },
                    tls: {
                        ciphers: 'SSLv3',
                        rejectUnauthorized: false
                    },
                    protocol: 'smtps',

                    defaults: {
                        from: 'services@ndfnb.de',
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
