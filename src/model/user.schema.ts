import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
import {Role} from "../common/decorators/roles.decorator";
import {ApiProperty} from "@nestjs/swagger";
import * as mongoose from "mongoose";
import {IsEmail, IsNotEmpty, IsPhoneNumber, MinLength} from "class-validator";


export class CreateAppUserDto {

    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    phoneNumber: string;


    static instanceOf(object: any): object is CreateAppUserDto {
        return !CreateB2BUserDto.instanceOf(object);
    }

    constructor(username: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
    }
}


export class CreateB2BUserDto {


    @ApiProperty()
    @IsEmail()
    readonly username: string;

    @ApiProperty()
    @MinLength(10, {
        message: 'Password is too short',
    })
    readonly password: string;

    @ApiProperty()
    @IsNotEmpty({
        message: 'No FirstName given',
    })
    firstName: string;

    @IsNotEmpty({
        message: 'No lastName given',
    })
    @ApiProperty()
    lastName: string;

    @IsPhoneNumber("DE",  {
        message: 'No valid phone number',
    })
    @ApiProperty()
    phoneNumber: string;

    @IsEmail({},{
        message: 'No valid email',
    })
    @ApiProperty()
    contactEmail: string;

    @IsNotEmpty({
        message: 'No company name given',
    })
    @ApiProperty()
    companyName: string;

    @IsNotEmpty({
        message: 'No company category given',
    })
    @ApiProperty()
    category: string;

    @IsNotEmpty({
        message: 'No ustid given',
    })
    @ApiProperty()
    ustid: string;

    @IsNotEmpty({
        message: 'No street given',
    })
    @ApiProperty()
    street: string;

    @IsNotEmpty({
        message: 'No housenumber given',
    })
    @ApiProperty()
    housenumber: string;

    @IsNotEmpty({
        message: 'No city given',
    })
    @ApiProperty()
    city: string;
    @IsNotEmpty()

    @IsNotEmpty({
        message: 'No zipcode given',
    })
    @ApiProperty()
    zipcode: string;

    @IsNotEmpty({
        message: 'country given',
    })
    @ApiProperty()
    country: string;



    static instanceOf(object: any): object is CreateB2BUserDto {
        return "ustid" && "companyName" && "category" in object;
    }


    constructor(username: string, password: string, firstName: string, lastName: string, phoneNumber: string, contactEmail: string, companyName: string, category: string, ustid: string, street: string, housenumber: string, city: string, zipcode: string, country: string) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.contactEmail = contactEmail;
        this.companyName = companyName;
        this.category = category;
        this.ustid = ustid;
        this.street = street;
        this.housenumber = housenumber;
        this.city = city;
        this.zipcode = zipcode;
        this.country = country;
    }
}

@Schema()
export class Adresse {
    @Prop()
    street: string;
    @Prop()
    housenumber: string;
    @Prop()
    city: string;
    @Prop()
    zipcode: string;
    @Prop()
    country: string;


    constructor(street: string, housenumber: string, city: string, zipcode: string, country: string) {
        this.street = street;
        this.housenumber = housenumber;
        this.city = city;
        this.zipcode = zipcode;
        this.country = country;
    }
}

@Schema()
export class CompanyInformation {

    @Prop()
    companyName: string;
    @Prop()
    category: string;
    @Prop()
    ustid: string;
    @Prop(Adresse)
    adresse: Adresse;


    constructor(companyName: string, category: string, ustid: string, adresse: Adresse) {
        this.companyName = companyName;
        this.category = category;
        this.ustid = ustid;
        this.adresse = adresse;
    }
}


@Schema()
export class User {

    @Prop()
    email: string;

    @Prop()
    lastLogin: Date;

    @Prop()
    password: string;

    @Prop([String])
    roles: Role[];

    @Prop()
    status: string;

    @Prop()
    username: string;


    _id: string;

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    phoneNumber: string;

    @Prop(CompanyInformation)
    company: CompanyInformation;


}


export type UserDocument = User & PassportLocalDocument;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(passportLocalMongoose);

