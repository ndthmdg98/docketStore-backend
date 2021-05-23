import {Inject, Injectable, Logger} from '@nestjs/common';
import {debug} from "console";
import {MailConfig} from "../auth/auth.module";
import {MailerService} from "@nestjs-modules/mailer";

@Injectable()
export class MailService {


    private logger = new Logger('MailerService');
    constructor(
        @Inject('MAIL_CONFIG') private readonly MAIL_CONFIG: MailConfig,
        @Inject('MailerService')private readonly mailerService: MailerService,
    ) {

    }


    async sendWelcomeEmail(receiverId: string, receiverMail: string, receiverFirstName,  code: string): Promise<boolean> {
        let success = true;
        const url = `${this.MAIL_CONFIG.authenticationHostname}/${receiverId}/${code}/`
        await this.mailerService.sendMail({
            subject: `Welcome to docketStore! Please Confirm Your Email Address`,
            to: receiverMail,
            from: 'service@ndfnb.de',
            date: new Date(),
            template: 'confirmation',
            context: {
                url: url,
                firstName: receiverFirstName
            },
            html: url
        }).then(() => {
            success = true;
            this.logger.log("Welcome Mail successfully sent!")
        }).catch(err => {
            debug(err);
            success = false;
            this.logger.log("An Error occurred sending welcome Mail!")
        });
        return success;

    }




}
