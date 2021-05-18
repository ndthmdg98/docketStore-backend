import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
import {Role} from "../common/decorators/roles.decorator";
import {ApiProperty} from "@nestjs/swagger";



export class CreateAppUserDto {


    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    readonly contact: IContactInformation;

    static instanceOf(object: any): object is ICreateAppUserDto {
        return !CreateB2BUserDto.instanceOf(object);
    }
}



interface ICreateAppUserDto{
    username: string;
    password: string;
    contact: IContactInformation
}


interface ICreateB2BUserDto{
    username: string;
    password: string;
    contact: IContactInformation
    company: ICompanyInformation
}









export class CreateB2BUserDto {

    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    readonly contact: IContactInformation

    @ApiProperty()
    readonly company: ICompanyInformation

    static  instanceOf(object: any): object is ICreateB2BUserDto {
        return 'company' in object;
    }

    constructor() {
    }


}


export interface IAdresse {
    street: string;
    housenumber: string;
    city: string;
    zipcode: string;
    country: string;
}

export interface ICompanyInformation {
    companyName: string;
    companyImagePath: string;
    category: string;
    ustid: string;
    adresse: IAdresse;
}

export interface IContactInformation {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    contactEmail: string;
}


@Schema()
export class User {

    @Prop(raw({
            companyName: {type: String},
            companyImagePath:  {type: String},
            category:  {type: String},
            ustid:  {type: String},
            adresse:  raw({
                street: String,
                housenumber: String,
                city: String,
                zipcode: String,
                country: String,
            })
        })
    )
    company: ICompanyInformation;

    @Prop()
    email: string;

    @Prop()
    lastLogin: Date;

    @Prop()
    password: string;

    @Prop()
    roles: Role[];

    @Prop()
    status: string;

    @Prop()
    username: string;


    _id: string;

    @Prop(raw({
        firstName: String,
        lastName: String,
        phoneNumber: String,
        contactEmail: String,
    }))
    contact: IContactInformation;


    constructor(userDocument: UserDocument) {
        this.company = userDocument.company;
        this.email = userDocument.email;
        this.lastLogin = userDocument.lastLogin;
        this.password = userDocument.password;
        this.roles = userDocument.roles;
        this.status = userDocument.status;
        this.username = userDocument.username;
        this._id = userDocument._id;
        this.contact = userDocument.contact;
    }
}


export type UserDocument = User & PassportLocalDocument;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(passportLocalMongoose);
UserSchema.methods.isActive = function isActive () {
    // @ts-ignore
    return ("status" in this && this.status == "active")
};
