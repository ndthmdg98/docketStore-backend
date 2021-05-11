import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {User, UserDocument, UserSchema} from "./user.schema";
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

export class MailVerificationDto {

    @ApiProperty()
    readonly receiver: UserDocument;

    @ApiProperty()
    readonly code: string;

    @ApiProperty()
    readonly dateCreated: Date;



}

export type MailDocument = Mail & Document;


export interface IMail {
    code: string;
    receiver: User;
    dateCreated: Date;
}


@Schema()
export class Mail implements IMail {
    @Prop({type: UserSchema})
    receiver: UserDocument;

    @Prop()
    code: string;

    @Prop()
    dateCreated: Date;


}

export const MailSchema = SchemaFactory.createForClass(Mail);

