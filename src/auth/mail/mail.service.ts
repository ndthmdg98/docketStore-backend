import {Inject, Injectable} from '@nestjs/common';

import {Model} from "mongoose";
import {debug} from "console";
import {InjectModel} from "@nestjs/mongoose";
import {MailerService} from "@nestjs-modules/mailer";
import {Mail, MailDocument, MailVerificationDto} from "../../model/mail.schema";
import {AppConfig} from "../../app-config.module";

@Injectable()
export class MailService {

    private readonly baseUrlAuth = this.APP_CONFIG.baseUrl + '/auth';


    constructor(
        @InjectModel('Mail') private readonly mailModel: Model<MailDocument>,
        @Inject('APP_CONFIG') private readonly APP_CONFIG: AppConfig,
        private readonly mailerService: MailerService,
    ) {

    }


    async sendWelcomeEmail(receiverId: string, receiverMail: string, receiverFirstName,  code: string): Promise<boolean> {
        let success = true;
        const url = `${this.baseUrlAuth}/${receiverId}/${code}/`
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
        }).catch(err => {
            debug(err);
            success = false;
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

    async create(mailVerificationDto: MailVerificationDto): Promise<MailDocument> {
        const createdMailVerification = new this.mailModel(mailVerificationDto);
        return await createdMailVerification.save();
    }

    async update(ID: string, newValue: MailDocument): Promise<MailDocument> {
        const mail_verification = await this.mailModel.findById(ID).exec();
        if (!
            mail_verification._id
        ) {
            debug('mail not found');
        }

        await this.mailModel.findByIdAndUpdate(ID, newValue).exec();
        return await this.mailModel.findById(ID).exec();
    }

    async delete(ID: string): Promise<MailDocument> {
        try {
            return await this.mailModel.findByIdAndRemove(ID).exec();
        } catch (err) {
            debug(err);
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

    public static generateCode(length: number): string {
        return this.generateCode(length);
    }


}
