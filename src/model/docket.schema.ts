import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {Readable} from "stream";

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
    @Prop(raw({
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        size: Number
    }))
    docketFile: DocketFile;

    toReadable(): Readable {
        const buffer = new Buffer(this.docketFile.buffer.buffer);
        const readable = new Readable()
        readable._read = () => {} // _read is required but you can noop it
        readable.push(buffer)
        readable.push(null)
        return readable;
    }

    getTags() {
        return this.tags;
    }

    addTag(tagId: string) {
        if (this.tags.includes(tagId)) {
            return ;
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
}

export const DocketSchema = SchemaFactory.createForClass(Docket);


