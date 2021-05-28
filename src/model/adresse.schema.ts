import {Prop, Schema} from "@nestjs/mongoose";

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
