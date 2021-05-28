import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {DocketDocument} from "../../model/docket.schema";
import {UserDocument} from "../../model/user.schema";
import {Readable} from "stream";
import {DocketFile} from "../../model/docket-file.schema";

@Injectable()
export class DocketService {

    constructor(@InjectModel('Dockets') private  docketModel: Model<DocketDocument>,
                @InjectModel('Users') private  userModel: Model<UserDocument>,
    ) {

    }

    async deleteById(docketId: string): Promise<boolean> {
        const result = await this.docketModel.findByIdAndDelete(docketId).exec();
        return !!result;

    }

    async findById(docketId: string): Promise<DocketDocument | null> {
        return await this.docketModel.findById(docketId).exec();
    }

    async findAllByUserId(userId: string): Promise<DocketDocument[]> {
        return await this.docketModel.find({receiverId: userId}).exec();
    }

    async findByTag(tagId: string): Promise<DocketDocument[]> {
        return await this.docketModel.find({tags: tagId}).exec();
    }

    async markDocketWithTag(docketId: string, tagId: string): Promise<boolean> {
        const docketDocument = await this.findById(docketId);
        const newlyTaggedDocket = this.addTag(docketDocument, tagId);
        const updatedDocketDocument = await this.updateById(docketId, {tags: newlyTaggedDocket.tags});
        return updatedDocketDocument.tags.includes(tagId);

    }

    async unmarkDocketWithTag(docketId: string, tagId: string): Promise<boolean> {
        const docketDocument = await this.findById(docketId);
        const docketWithRemovedTag = this.removeTag(docketDocument, tagId);
        const updatedDocketDocument = await this.updateById(docketId, {tags: docketWithRemovedTag.tags});
        return !updatedDocketDocument.tags.includes(tagId);

    }

    removeTag(docket: DocketDocument, tagId: string): DocketDocument {
        const index = docket.tags.indexOf(tagId, 0)
        if (index > -1) {
            docket.tags.splice(index, 1);
        }
        return docket
    }

    addTag(docket: DocketDocument, tagId: string): DocketDocument {
        if (docket.tags.includes(tagId)) {
            return docket;
        } else {
            docket.tags.push(tagId)
        }
        return docket
    }

    async create(receiverId: string, senderId: string, docketFile: DocketFile): Promise<DocketDocument | null> {
        const receiver = await this.userModel.findById(receiverId);
        if (!receiver) {
            return null;
        }
        const createdDocket = new this.docketModel({
            createdAt: new Date(),
            receiverId: receiverId,
            senderId: senderId,
            tags: [],
            docketFile: docketFile,
            docketContent: null
        });
        return createdDocket.save();
    }


    private async updateById(docketId: string, valuesToChange: object): Promise<DocketDocument> {
        return await this.docketModel.findByIdAndUpdate(docketId, valuesToChange).exec();
    }

    toReadable(docketFile: DocketFile): Readable {
            const buffer = new Buffer(docketFile.buffer);
            const readable = new Readable()
            readable._read = () => {
            } // _read is required but you can noop it
            readable.push(buffer)
            readable.push(null)
            return readable;
    }
}
