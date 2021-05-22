import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';

import {ApiProperty} from "@nestjs/swagger";

export type TagDocument = Tag & Document;

export class CreateTagDto {
    @ApiProperty()
    readonly tagName: string;

    @ApiProperty()
    readonly userId: string;


    constructor(userId: string, tagName: string) {
        this.userId = userId;
        this.tagName = tagName;
    }
}


@Schema()
export class Tag {

    @Prop()
    tagName: string;
    @Prop()
    createdAt: Date;
    @Prop()
    userId: string;


}

export const TagSchema = SchemaFactory.createForClass(Tag);


