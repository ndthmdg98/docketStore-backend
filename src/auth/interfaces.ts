import {ApiProperty} from "@nestjs/swagger";
import {ICompanyInformation, IContactInformation} from "../model/user.schema";

export interface JwtPayloadInterface {
    id: string
    username: string;
    firstName: string;
    lastName: string;
}

export interface IResponse {
    status: number;
    data: any;
    success: boolean;
}
export interface IToken {
    readonly expiresIn: number;
    readonly accessToken: string;
}


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





