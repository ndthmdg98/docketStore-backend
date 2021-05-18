import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

export class MailVerificationDto {

    @ApiProperty()
    readonly receiverId: string;
    @ApiProperty()
    readonly code: string;
    @ApiProperty()
    readonly dateCreated: Date;

}
export type MailDocument = Mail & Document;

@Schema()
export class Mail {
    @Prop()
    receiverId: string;
    @Prop()
    code: string;
    @Prop()
    dateCreated: Date;
}

export const MailSchema = SchemaFactory.createForClass(Mail);

