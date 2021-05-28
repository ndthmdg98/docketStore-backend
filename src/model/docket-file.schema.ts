import {Prop, Schema} from "@nestjs/mongoose";

@Schema()
export class DocketFile {
    @Prop()
    encoding: string;
    @Prop()
    mimetype: string;
    @Prop()
    buffer: number[];
    @Prop()
    size: number;


    constructor(encoding: string, mimetype: string, buffer: number[], size: number) {
        this.encoding = encoding;
        this.mimetype = mimetype;
        this.buffer = buffer;
        this.size = size;
    }

}
