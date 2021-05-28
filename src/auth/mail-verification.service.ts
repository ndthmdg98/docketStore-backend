import {Inject, Injectable, Logger} from '@nestjs/common';

import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {MailDocument, MailVerificationDto} from "../model/mail.schema";
import {CodeGeneratorService} from "./code-generator.service";

@Injectable()
export class MailVerificationService {

    private logger = new Logger('MailService');

    constructor(@InjectModel('Mails') private readonly mailModel: Model<MailDocument>,
                private readonly codeGeneratorService: CodeGeneratorService) {
    }


    async findOne(options: Object): Promise<MailDocument> {
        return await this.mailModel.findOne(options).exec();
    }


    async create(userId: string): Promise<any> {
        const mailVerificationDto = new MailVerificationDto(userId, this.codeGeneratorService.generateCode(10));
        const createdMailVerification = new this.mailModel(mailVerificationDto);
        const mailVerification = await createdMailVerification.save();
        if (mailVerification.errors) {
            this.logger.log(mailVerification.errors);
            return null;
        } else {
            return mailVerification;
        }
    }



}
