import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
import * as mongoose from "mongoose";
import {Role} from "../common/decorators/roles.decorator";




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



export const AdresseSchema = new mongoose.Schema({
    street: {type: String, unique: false},
    housenumber: {type: String, unique: false},
    city: {type: String, unique: false},
    zipcode: {type: String, unique: false},
    country: {type: String, unique: false},
});

export const CompanyInformationSchema = new mongoose.Schema({
    companyName: {type: String, unique: false},
    category: {type: String, unique: false},
    taxID: {type: String, unique: false},
    adresse: {type: AdresseSchema, unique: false},
    companyImagePath: {type: String, unique: false},

});

export const ContactInformationSchema = new mongoose.Schema({
    firstName: {type: String, unique: false},
    lastName: {type: String, unique: false},
    phoneNumber: {type: String, unique: false},
    contactEmail: {type: String, unique: false},
});


export interface IUser {

    company: ICompanyInformation;
    contact: IContactInformation;
    email: string;
    lastLogin: Date;
    password: string;
    roles: string[];
    status: string;
    username: string;
    _id?: string;

}


@Schema()
export class User implements IUser {

    @Prop()
    company: ICompanyInformation;

    @Prop()
    contact: IContactInformation;

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




}

export type UserDocument = User & PassportLocalDocument;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(passportLocalMongoose);
