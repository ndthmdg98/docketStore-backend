import {IsEmail, IsNotEmpty, IsPhoneNumber, MinLength} from "class-validator";


export class CreateAppUserDto {

    @IsEmail()
    username: string;


    @MinLength(10, {
        message: 'Password is too short',
    })
    password: string;


    @IsNotEmpty({
        message: 'No FirstName given',
    })
    firstName: string;

    @IsNotEmpty({
        message: 'No lastName given',
    })
    lastName: string;

    @IsPhoneNumber("DE",  {
        message: 'No valid phone number',
    })
    phoneNumber: string;

    constructor(username: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
    }
}

export class LoginUserDto {

    @IsEmail({},{
        message: 'Please enter a valid mail',
    })
    username: string;
    @IsNotEmpty({
        message: 'No empty passwords',
    })
    password: string;


    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}

export class CreateB2BUserDto {

    @IsEmail()
    username: string;

    @MinLength(10, {
        message: 'Password is too short',
    })
    password: string;

    @IsNotEmpty({
        message: 'No FirstName given',
    })
    firstName: string;

    @IsNotEmpty({
        message: 'No lastName given',
    })
    lastName: string;

    @IsPhoneNumber("DE",  {
        message: 'No valid phone number',
    })
    phoneNumber: string;

    @IsEmail({},{
        message: 'No valid email',
    })
    @IsNotEmpty({
        message: 'No contactMail given',
    })
    contactEmail: string;

    @IsNotEmpty({
        message: 'No company name given',
    })
    companyName: string;

    @IsNotEmpty({
        message: 'No company category given',
    })
    category: string;

    @IsNotEmpty({
        message: 'No ustid given',
    })
    ustid: string;

    @IsNotEmpty({
        message: 'No street given',
    })
    street: string;

    @IsNotEmpty({
        message: 'No housenumber given',
    })
    housenumber: string;

    @IsNotEmpty({
        message: 'No city given',
    })
    city: string;

    @IsNotEmpty({
        message: 'No zipcode given',
    })
    zipcode: string;

    @IsNotEmpty({
        message: 'country given',
    })
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
