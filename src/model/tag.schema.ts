import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {Document} from 'mongoose';

export type TagDocument = Tag & Document;

export interface ITag {
    tagName: string;
    owner: User;
    _id?: string;
}

@Schema()
export class Tag implements ITag {
    @Prop()
    tagName: string;
    @Prop({type: UserSchema})
    owner: User;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

