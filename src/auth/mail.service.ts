import {Inject, Injectable, Logger} from '@nestjs/common';

import {Model} from "mongoose";
import {debug} from "console";
import {InjectModel} from "@nestjs/mongoose";
import {MailerService} from "@nestjs-modules/mailer";
import {MailConfig} from "./auth.module";
import {MailDocument, MailVerificationDto} from "../model/mail.schema";

@Injectable()
export class MailService {


    private logger = new Logger('MailService');
    constructor(
        @InjectModel('Mails') private readonly mailModel: Model<MailDocument>,
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


    async findAll(): Promise<MailDocument[]> {
        return await this.mailModel.find().exec();
    }

    async findOne(options: Object): Promise<MailDocument> {
        return await this.mailModel.findOne(options).exec();
    }

    async findById(ID: string): Promise<MailDocument> {
        return await this.mailModel.findById(ID).exec();
    }

    async create(userId: string): Promise<any> {
        const mailVerificationDto = new MailVerificationDto(userId, this.generateCode(10));
        const createdMailVerification = new this.mailModel(mailVerificationDto);
        const mailVerification =  await createdMailVerification.save();
        if (mailVerification.errors) {
            this.logger.log(mailVerification.errors);
            return null;
        } else {
            return mailVerification;
        }
    }

    generateCode(length: number): string {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }




}
