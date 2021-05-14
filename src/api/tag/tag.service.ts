import {Injectable} from '@nestjs/common';
import {User, UserDocument,} from "../../model/user.schema";
import {Tag, TagDocument} from "../../model/tag.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {debug} from "console";
import {CreateTagDto} from "./interfaces";




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

    async findAllByUser(user: User): Promise<TagDocument[]> {
        return this.tagModel.find({owner: user}).exec();
    }

    async findById(tagId: string): Promise<TagDocument> {
        return await this.tagModel.findById(tagId).exec();
    }

    async updateById(tagId: string, valuesToChange: object): Promise<TagDocument> {
        await this.tagModel.findByIdAndUpdate(tagId, valuesToChange).exec();
        return await this.tagModel.findById(tagId).exec();
    }

    async createStandardTags(userId: string): Promise<void> {
        await this.create({tagName: "Archiviert", userId: userId}).then(result => {
            if (result.errors) {
                //TODO log errors
            } else {

            }
        })

        await this.create({tagName: "Garantie",userId: userId}).then(result => {
            if (result.errors) {
                //TODO log errors
            } else {

            }
        })

        await this.create({tagName: "Steuererklärung", userId: userId}).then(result => {
            if (result.errors) {
                //TODO log errors
            } else {

            }
        })
    }


}
