import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User, UserSchema, UserViewModel} from "./user.schema";
import {Document} from 'mongoose';

export type TagDocument = Tag & Document;


export interface TagViewModel {
    tagName: string;
    createdAt: Date;
    userId: string;
    _id?: string;
}

@Schema()
export class Tag {

    @Prop()
    tagName: string;
    @Prop()
    createdAt: Date;
    @Prop()
    userId: string;

    toViewModel: Function;

}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.methods.toViewModel = function (): TagViewModel {
    return {_id: this._id, createdAt: this.createdAt, userId: this, tagName: this.tagName};
}

