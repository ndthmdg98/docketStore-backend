import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {CreateTagDto, TagDocument} from "../../../model/tag.schema";
import {APIResponse} from "../../../interfaces";




@Injectable()
export class TagService  {

    constructor(@InjectModel('Tags') private  tagModel: Model<TagDocument>,
    ) {

    }

    async create(createObjectDto: CreateTagDto): Promise<TagDocument> {
        const createdTagDocument = new this.tagModel({
            userId: createObjectDto.userId,
            tagName: createObjectDto.tagName
        });
        return createdTagDocument.save();
    }

    async findAllByUserId(userId: string): Promise<TagDocument[]> {
        return this.tagModel.find({userId: userId}).exec();
    }

    async findById(tagId: string): Promise<TagDocument> {
        return await this.tagModel.findById(tagId).exec();
    }

    async deleteById(tagId: string): Promise<boolean> {
        const deletedTag = await this.tagModel.findByIdAndDelete(tagId).exec();
        return !!deletedTag;
        
    }

    async rename(tagId: string, newTagName: string): Promise<boolean> {
        const renamedTagDocument = await this.tagModel.findByIdAndUpdate(tagId, {tagName: newTagName});
        const renamedTag = renamedTagDocument.toObject();
        return renamedTag.tagName == newTagName;
    }
}
