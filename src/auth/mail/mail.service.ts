import {Injectable} from '@nestjs/common';

import {Model} from "mongoose";
import {debug} from "console";
import {InjectModel} from "@nestjs/mongoose";
import {MailerService} from "@nestjs-modules/mailer";
import {User, UserDocument} from "../../model/user.schema";
import {Mail, MailDocument, MailVerificationDto} from "../../model/mail.schema";
import {Config} from "../../shared/config";


export interface IMailService<T> {
    findAll(): Promise<MailDocument[]>;

    findById(ID: string): Promise<MailDocument>;

    findOne(options: object): Promise<MailDocument>;

    create(mailVerificationDto: MailVerificationDto): Promise<boolean>;

    update(ID: string, newValue: Mail): Promise<MailDocument>;

    delete(ID: string): Promise<MailDocument>;

    sendWelcomeEmail(user: UserDocument, code: string): Promise<any>;

    generateCode(length: number): string;
}

@Injectable()
export class MailService implements IMailService<UserDocument> {

    private readonly baseUrlAuth = Config.baseUrl + '/auth';


    constructor(
        @InjectModel('Mail') private readonly mailModel: Model<MailDocument>,
        private readonly mailerService: MailerService,
    ) {

    }


    async sendWelcomeEmail(receiver: UserDocument, code: string): Promise<boolean> {
        let success = true;
        const url = `${this.baseUrlAuth}/${receiver._id}/${code}/`
        await this.mailerService.sendMail({
            subject: `Welcome to docketStore! Please Confirm Your Email Address`,
            to: receiver.username,
            from: 'service@ndfnb.de',
            date: new Date(),
            template: 'confirmation',
            context: {
                url: url,
                firstName: receiver.contact.firstName
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

    async create(mailVerificationDto: MailVerificationDto): Promise<boolean> {
        const createdMailVerification = new this.mailModel(mailVerificationDto);
        await createdMailVerification.save();
        return await this.sendWelcomeEmail(mailVerificationDto.receiver, mailVerificationDto.code);
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
