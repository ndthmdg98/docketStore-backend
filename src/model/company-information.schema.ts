import {Prop, Schema} from "@nestjs/mongoose";
import {Adresse} from "./adresse.schema";

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
