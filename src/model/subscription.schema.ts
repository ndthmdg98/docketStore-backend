import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {User} from "./user.schema";
import {Document} from 'mongoose';

import {ApiProperty} from "@nestjs/swagger";

export class CreateSubscriptionDto {

    @ApiProperty()
    readonly endpoint: string;

    @ApiProperty()
    readonly expirationTime: string;

    @ApiProperty()
    readonly keys: IKeys;



}


export interface IKeys {
    p256dh: string;
    auth: string;
}

export interface ISubscription {

    endpoint: string;
    expirationTime: string;
    keys: IKeys;
    user: User;

}

@Schema()
export class Subscription implements ISubscription {
    @Prop()
    endpoint: string;

    @Prop()
    expirationTime: string;

    @Prop()
    keys: IKeys;

    @Prop({type: User})
    user: User;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
export type SubscriptionDocument = Subscription & Document;
