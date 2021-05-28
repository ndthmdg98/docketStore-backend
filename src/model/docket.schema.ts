import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {DocketFile} from "./docket-file.schema";

@Schema()
export class Docket {

    @Prop()
    tags: string[];
    @Prop({type: Date})
    createdAt: Date;
    @Prop()
    receiverId: string;
    @Prop()
    senderId: string;

    @Prop(DocketFile)
    docketFile: DocketFile;

    _id: string;

}


export const DocketSchema = SchemaFactory.createForClass(Docket);
export type  DocketDocument = Docket & Document;
