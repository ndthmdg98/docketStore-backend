import {PassportLocalModel, Model} from 'mongoose';
import {Body, Delete, Get, Injectable, Param, Post, Put, UseGuards} from '@nestjs/common';
import {debug} from 'console';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../../model/user.schema";
import {CreateAppUserDto, CreateB2BUserDto} from "../interfaces";
import {TagService} from "../../api/tag/tag.service";

export interface IUserService {
    createUser(userToCreate: CreateAppUserDto | CreateB2BUserDto): Promise<UserDocument>;

    findAll(req, res): Promise<User[]>;

    findById(id: string): Promise<User | null>;

    findOne(options: object): Promise<User[] | User | null>;

    updateByID(id: string, valuesUseroChange: object): Promise<User | null>;

    updateOne(findUserOptions: object, valuesUseroChange: object): Promise<User | null>;

    deleteAll(req, res): Promise<any>;

    deleteByID(id: string): Promise<any>;

    deleteOne(options: object): Promise<any>;
}


@Injectable()
export class UserService implements IUserService {
    constructor(@InjectModel('Users') private readonly userModel: PassportLocalModel<UserDocument>, private tagService: TagService) {

    }

    async createUser(userToCreate: CreateB2BUserDto | CreateAppUserDto): Promise<UserDocument> {
        if (CreateB2BUserDto.instanceOf(userToCreate)) {
            const user = await this.userModel.register(new this.userModel(
                {
                    username: userToCreate.username,
                    email: userToCreate.username,
                    contact: userToCreate.contact,
                    company: userToCreate.company,
                    status: "pending",
                    roles: ['b2b_user'],
                    lastLogin: new Date()
                }), userToCreate.password);
            return user;
        } else {
            const user = await this.userModel.register(new this.userModel(
                {
                    username: userToCreate.username,
                    email: userToCreate.username,
                    contact: userToCreate.contact,
                    status: "pending",
                    roles: ['app_user'],
                    // @ts-ignore
                    lastLogin: new Date()
                }), userToCreate.password);

            await this.tagService.createStandardTags(user._id);
            return user;
        }
    }




    async findAll(): Promise<UserDocument[]> {
        return await this.userModel.find().exec();
    }

    async findOne(options: object): Promise<UserDocument> {
        return await this.userModel.findOne(options).exec();
    }

    async findById(id: string): Promise<UserDocument> {
        return await this.userModel.findById(id).exec();
    }


    async updateOne(findUserDocumentOptions: object, valuesToChange: object): Promise<UserDocument | null> {
        return Promise.resolve(undefined);
    }

    async updateByID(id: string, valuesToChange: object): Promise<UserDocument | null> {
        const user = await this.userModel.findById(id).exec();
        if (!user._id) {
            debug('user not found');
        }
        await this.userModel.findByIdAndUpdate(id, valuesToChange).exec();
        debug("user updated: ", user)
        debug("to values ", valuesToChange)
        return await this.userModel.findById(id).exec();
    }

    async deleteAll(): Promise<boolean> {
        try {
            await this.userModel.deleteMany({}).exec();
            return true;
        } catch (err) {
            return false;
        }
    }

    async deleteByID(@Param('id') id: string): Promise<any> {
        try {
            await this.userModel.findByIdAndRemove(id).exec();
            return true;
        } catch (err) {
            debug(err);
            return false
        }
    }

    async deleteOne(@Body() options: object): Promise<boolean> {
        return Promise.resolve(undefined);
    }


}
