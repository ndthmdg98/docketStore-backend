import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {User, UserSchema, UserViewModel} from "./user.schema";
import {Document} from 'mongoose';
import {Readable} from "stream";
import {Tag, TagViewModel} from "./tag.schema";

export type  DocketDocument = Docket & Document;




export interface DocketViewModel {
    createdAt: Date;
    senderId: string;
    receiverId: string;
    tags: string[];
    _id?: string
}


export interface DocketFile {
    encoding: string;
    mimetype: string;
    buffer: Buffer
    size: number

}

@Schema()
export class Docket {

    @Prop()
    tags: string[];
    @Prop()
    createdAt: Date;
    @Prop()
    receiverId: string;
    @Prop()
    senderId: string;
    @Prop()
    docketFile: DocketFile;

    toViewModel: Function;
    toReadable: Function;
    getSender: Function;
    getReceiver: Function;
    getTags: Function;


}

export const DocketSchema = SchemaFactory.createForClass(Docket);
DocketSchema.methods.toViewModel = function (): DocketViewModel {
    return {_id: this._id, createdAt: this.createdAt, receiverId: this.receiverId, senderId: this.senderId, tags: this.tags};
}
DocketSchema.methods.toReadable = function (): Readable {
    const buffer = new Buffer(this.docketFile.buffer.buffer);
    const readable = new Readable()
    readable._read = () => {} // _read is required but you can noop it
    readable.push(buffer)
    readable.push(null)
    return readable;
}

DocketSchema.methods.getSender = function (): User {
    return this.sender;
}
DocketSchema.methods.getReceiver = function (): User {
   return this.receiver;
}

DocketSchema.methods.getTags = function (): string[] {
    return this.tags;
}
