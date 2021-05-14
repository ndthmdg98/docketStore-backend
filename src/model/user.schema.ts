import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
import {Role} from "../common/decorators/roles.decorator";




export interface IAdresse {
    street: string;
    housenumber: string;
    city: string;
    zipcode: string;
    country: string;
}

export interface AdresseViewModel {
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

export interface CompanyInformationViewModel {
    companyName: string;
    companyImagePath: string;
    category: string;
    ustid: string;
    adresse: AdresseViewModel;
}


export interface IContactInformation {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    contactEmail: string;
}

export interface ContactInformationViewModel {
    firstName: string;
    lastName: string;
}

export interface UserViewModel {
    company: CompanyInformationViewModel
    contact: ContactInformationViewModel
    _id?: string
}

@Schema()
export class User {



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

    @Prop()
    company?: ICompanyInformation;

}



export type UserDocument = User & PassportLocalDocument;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(passportLocalMongoose);
UserSchema.methods.toViewModel = function (): UserViewModel {
    return {_id: this._id, contact: {firstName: this.contact.firstName, lastName: this.contact.lastName}, company: this.company};
}
