import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';

@Schema()
export class DocketFile {
    @Prop()
    encoding: string;
    @Prop()
    mimetype: string;
    @Prop({type: [Number]})
    buffer: number[];
    @Prop()
    size: number;


    constructor(encoding: string, mimetype: string, buffer: Buffer, size: number) {
        this.encoding = encoding;
        this.mimetype = mimetype;
        this.buffer = buffer.toJSON().data;
        this.size = size;
    }

}
export const DocketFileSchema = SchemaFactory.createForClass(DocketFile)

@Schema()
export class Docket {

    @Prop({type: [String]})
    tags: string[];
    @Prop({type: Date})
    createdAt: Date;
    @Prop()
    receiverId: string;
    @Prop()
    senderId: string;

    @Prop({type: DocketFileSchema})
    docketFile: DocketFile;

    _id: string;

}


export const DocketSchema = SchemaFactory.createForClass(Docket);
export type  DocketDocument = Docket & Document;
