import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {Readable} from "stream";
import {ApiProperty} from "@nestjs/swagger";

export type  DocketDocument = Docket & Document;


export class DocketFile {
    encoding: string;
    mimetype: string;
    buffer: Buffer
    size: number


    constructor(encoding: string, mimetype: string, buffer: Buffer, size: number) {
        this.encoding = encoding;
        this.mimetype = mimetype;
        this.buffer = buffer;
        this.size = size;
    }

    toReadable(): Readable {
        const buffer = new Buffer(this.buffer.buffer);
        const readable = new Readable()
        readable._read = () => {
        } // _read is required but you can noop it
        readable.push(buffer)
        readable.push(null)
        return readable;
    }
}



export class CreateDocketDto {
    @ApiProperty()
    readonly receiverId: string;
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
    @Prop(raw({
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        size: Number
    }))
    docketFile: DocketFile;

    _id: string;


    getTags() {
        return this.tags;
    }

    addTag(tagId: string) {
        if (this.tags.includes(tagId)) {
            return;
        } else {
            this.tags.push(tagId)

        }
    }

    removeTag(tagId: string) {
        const index = this.tags.indexOf(tagId, 0)
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }


    constructor(docketDocument: DocketDocument) {
        this.tags = docketDocument.tags;
        this.createdAt = docketDocument.createdAt;
        this.receiverId = docketDocument.receiverId;
        this.senderId = docketDocument.senderId;
        this.docketFile = docketDocument.docketFile;
        this._id = docketDocument._id;
    }

}

export const DocketSchema = SchemaFactory.createForClass(Docket);


