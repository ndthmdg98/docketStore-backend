import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Docket, DocketDocument, DocketFile} from "../../model/docket.schema";

@Injectable()
export class DocketService {

    constructor(@InjectModel('Dockets') private  docketModel: Model<DocketDocument>,
    ) {

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

    async markDocketWithTag(docketId: string, tagId: string): Promise<DocketDocument> {
        const docket = await this.findById(docketId);
        docket.addTag(tagId);
        return await this.updateById(docketId, {tags: docket.getTags()})
    }

    async unmarkDocketWithTag(docketId: string, tagId: string): Promise<DocketDocument> {
        const docket = await this.findById(docketId);
        docket.removeTag(tagId);
        return await this.updateById(docketId, {tags: docket.getTags()})
    }

    async create(receiverId: string, senderId: string, docketFile: DocketFile): Promise<DocketDocument> {
        const createdDocket = new this.docketModel({
            createdAt: new Date(),
            receiverId: receiverId,
            senderId: senderId,
            tags: [],
            docketFile: docketFile
        });
        return createdDocket.save();
    }

    async deleteById(docketId: string): Promise<Docket> {
        return await this.docketModel.findByIdAndDelete(docketId).exec();
    }




    private async updateById(docketId: string, valuesToChange: object): Promise<DocketDocument> {
        return await this.docketModel.findByIdAndUpdate(docketId, valuesToChange).exec();
    }
}
