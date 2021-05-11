import {Injectable} from '@nestjs/common';
import {User, UserDocument,} from "../../model/user.schema";
import {Tag, TagDocument} from "../../model/tag.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {debug} from "console";
import {CreateTagDto} from "./interfaces";

export interface ITagService {
    create(createObjectDto: CreateTagDto, user: UserDocument): Promise<TagDocument>;

    updateById(tagId: string, valuesToChange: object): Promise<TagDocument>;

    findAllByUser(user: User): Promise<TagDocument[]>;

    findById(tagId: string): Promise<TagDocument>
}


@Injectable()
export class TagService implements ITagService {

    constructor(@InjectModel('Tags') private  tagModel: Model<TagDocument>,
    ) {

    }

    async create(createObjectDto: CreateTagDto, user: UserDocument): Promise<TagDocument> {
        const createdTagDocument = new this.tagModel({
            owner: user,
            tagName: createObjectDto.tagName
        });
        return createdTagDocument.save();
    }

    async findAllByUser(user: UserDocument): Promise<TagDocument[]> {
        return this.tagModel.find({owner: user}).exec();
    }

    async findById(tagId: string): Promise<TagDocument> {
        return await this.tagModel.findById(tagId).exec();
    }

    async updateById(tagId: string, valuesToChange: object): Promise<TagDocument> {
        await this.tagModel.findByIdAndUpdate(tagId, valuesToChange).exec();
        return await this.tagModel.findById(tagId).exec();
    }

    async createStandardTags(user: UserDocument): Promise<any> {
        await this.create({tagName: "Archiviert"}, user);
        await this.create({tagName: "Garantie"}, user);
        await this.create({tagName: "Steuererklärung"}, user);
    }


}
