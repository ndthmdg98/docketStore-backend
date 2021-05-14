import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../../model/user.schema";
import {Model} from "mongoose";
import {Docket, DocketDocument, DocketFile} from "../../model/docket.schema";
import {Tag} from "../../model/tag.schema";

@Injectable()
export class DocketService {

    constructor(@InjectModel('Dockets') private  docketModel: Model<DocketDocument>,
    ) {

    }

    async findById(docketId: string): Promise<DocketDocument | null> {
        return await this.docketModel.findById(docketId).exec();
    }

    async findAllByUser(user: UserDocument): Promise<DocketDocument[]> {
        return await this.docketModel.find({receiver: user}).exec();
    }

    async findByTag(tag: Tag): Promise<DocketDocument[]> {
        return await this.docketModel.find({tag}).exec();
    }

    async markDocketWithTag(docketId: string, tagId: string): Promise<DocketDocument> {
        const docket = await this.findById(docketId);
        const tags: string[] = docket.getTags();
        if (tags.includes(tagId)) {
            return docket;
        } else {
            tags.push(tagId)
            return await this.updateById(docketId, {tags: tags})
        }
    }

    async unmarkDocketWithTag(docketId: string, tagId: string): Promise<DocketDocument> {
        const docket = await this.findById(docketId);
        const tags = docket.getTags();
        const index = tags.indexOf(tagId, 0)
        if (index > -1) {
            tags.splice(index, 1);
        }
        return await this.updateById(docketId, {tags: tags})
    }

    async create(receiverId: string, senderId: string, docketFile: DocketFile): Promise<DocketDocument> {
        const createdDocket = new this.docketModel({
            createdAt: new Date(),
            receiverId: receiverId,
            senderId: senderId,
            tags: new Set(),
            docketFile: docketFile
        });
        return createdDocket.save();
    }

    async deleteById(docketId: string): Promise<DocketDocument> {
        return await this.docketModel.findByIdAndDelete(docketId).exec();
    }


    private async updateById(docketId: string, valuesToChange: object): Promise<DocketDocument> {
        return await this.docketModel.findByIdAndUpdate(docketId, valuesToChange).exec();
    }
}
