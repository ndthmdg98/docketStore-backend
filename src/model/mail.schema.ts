import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {IsNotEmpty} from "class-validator";

export class MailVerificationDto {

    @IsNotEmpty()
    readonly receiverId: string;
    @IsNotEmpty()
    readonly code: string;
    @IsNotEmpty()
    readonly dateCreated: Date;


    constructor(receiverId: string, code: string) {
        this.receiverId = receiverId;
        this.code = code;
        this.dateCreated = new Date();
    }
}
export type MailDocument = MailVerification & Document;

@Schema()
export class MailVerification {
    @Prop()
    receiverId: string;
    @Prop()
    code: string;
    @Prop()
    dateCreated: Date;
}

export const MailSchema = SchemaFactory.createForClass(MailVerification);

