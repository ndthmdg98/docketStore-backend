import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {Document} from 'mongoose';

export type DocketDocument = Docket & Document;

export interface IDocket {
    filePath: string;
    createdAt: Date;
    sender: User;
    receiver: User;
    tags: String[];
    docket: Blob;
    _id?: string;

}

@Schema()
export class Docket implements IDocket {
    @Prop()
    filePath: string;
    @Prop()
    tags: String[];
    @Prop()
    createdAt: Date;
    @Prop({type: UserSchema})
    receiver: User;
    @Prop({type: UserSchema})
    sender: User;
    @Prop()
    docket: Blob;
}

export const DocketSchema = SchemaFactory.createForClass(Docket);

