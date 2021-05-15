import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
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








}


export type UserDocument = User & PassportLocalDocument;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(passportLocalMongoose);
UserSchema.methods.isActive = function isActive () {
    // @ts-ignore
    return ("status" in this && this.status == "active")
};
