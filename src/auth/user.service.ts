import {PassportLocalModel} from 'mongoose';
import {Body, Injectable, Param} from '@nestjs/common';
import {debug} from 'console';
import {InjectModel} from "@nestjs/mongoose";
import {
    CreateAppUserDto,
    CreateB2BUserDto,
    Adresse,
    User,
    UserDocument,
    CompanyInformation
} from "../model/user.schema";


@Injectable()
export class UserService {
    constructor(@InjectModel('Users')  readonly userModel: PassportLocalModel<UserDocument>) {

    }

    async existsUsername(username: string): Promise<any> {
        const user = await this.findByUsername(username);
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    async createUser(userToCreate: CreateB2BUserDto | CreateAppUserDto): Promise<any> {
        if (CreateB2BUserDto.instanceOf(userToCreate)) {
            const adresse = new Adresse(userToCreate.street, userToCreate.housenumber, userToCreate.city, userToCreate.zipcode, userToCreate.country)
            const company = new CompanyInformation(userToCreate.companyName, userToCreate.category, userToCreate.ustid, adresse)
            return await this.userModel.register(new this.userModel(
                {
                    username: userToCreate.username,
                    password: userToCreate.password,
                    firstName: userToCreate.firstName,
                    lastName: userToCreate.lastName,
                    phoneNumber: userToCreate.phoneNumber,
                    contactEmail: userToCreate.contactEmail,
                    companyName: userToCreate.companyName,
                    category: userToCreate.category,
                    ustid: userToCreate.ustid,
                    street: userToCreate.street,
                    housenumber: userToCreate.housenumber,
                    city: userToCreate.city,
                    zipcode: userToCreate.zipcode,
                    country: userToCreate.country,

                    email: userToCreate.username,
                    company: company,
                    status: "pending",
                    roles: ['b2b_user'],
                    lastLogin: new Date()
                }), userToCreate.password);
        } else {
            return await this.userModel.register(new this.userModel(
                {
                    username: userToCreate.username,
                    email: userToCreate.username,
                    firstName: userToCreate.firstName,
                    lastName: userToCreate.lastName,
                    phoneNumber: userToCreate.phoneNumber,
                    status: "pending",
                    roles: ['app_user'],
                    // @ts-ignore
                    lastLogin: new Date()
                }), userToCreate.password);
        }
    }

    async findByUsername(username: string): Promise<any> {
        return await this.userModel.findOne({username: username}).exec();
    }

    async findById(id: string): Promise<any> {
        return await this.userModel.findById(id).exec();
    }

    async updateByID(id: string, valuesToChange: object): Promise<any> {
        return await this.userModel.findByIdAndUpdate(id, valuesToChange).exec();
    }

    async activateUser(userId): Promise<any> {
        await this.updateByID(userId, {status: "active"});
        const updatedUserDocument = await this.userModel.findById(userId).exec();
        return updatedUserDocument.status == "active";

    }

    async isUserActive(userId): Promise<any> {
        const user = await this.findById(userId);
        return user.status == "active";

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


}
