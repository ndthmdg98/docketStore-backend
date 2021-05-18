import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {Docket} from "./docket.schema";
import {ApiProperty} from "@nestjs/swagger";

export type  ExternalAPIAccountDocument = ExternalAPIAccount & Document;

export interface ExternalAPI {

    baseUrl: string;
    fetchUrl: string;
    loginUrl: string

    authenticate(email: string, password: string): Promise<string>;

    fetchDockets(externalAPIAccount: ExternalAPIAccount): Promise<any[]>;

    transformDocket(object: any): Promise<Docket>;

}


export interface IToken {
     accessToken: string;
     expiresIn?: number;
     refreshToken?: string;
}


export const implementedExternalAPIs = new Map<number, string>([
    [1, "Rewe"],
    [2, "Lidl"],
    [3, "Dm"]
]);

export class CreateExternalAPIAccountDto {
    @ApiProperty()
    readonly externalAPI: number;

    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly password: string;


}

export class ChangePasswordDto {
    @ApiProperty()
    password1: string;
    @ApiProperty()
    password2: string
}

@Schema()
export class ExternalAPIAccount {

    @Prop()
    externalAPI: number;

    @Prop()
    userId: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    _id: string;

    @Prop()
    refreshToken: string;

    @Prop()
    createdAt: Date;


}

export const ExternalAPIAccountSchema = SchemaFactory.createForClass(ExternalAPIAccount);


