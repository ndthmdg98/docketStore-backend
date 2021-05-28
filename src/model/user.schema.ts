import * as passportLocalMongoose from 'passport-local-mongoose';
import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {PassportLocalDocument} from "mongoose";
import {Role} from "../common/decorators/roles.decorator";
import {CompanyInformation} from "./company-information.schema";

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

