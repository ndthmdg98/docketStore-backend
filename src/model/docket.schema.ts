import {Prop, raw, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {Readable} from "stream";
import {ApiProperty} from "@nestjs/swagger";



@Schema()
export class DocketFile {
    @Prop()
    encoding: string;
    @Prop()
    mimetype: string;
    @Prop(raw({
        encoding: {type: String},
        mimetype: {type: String},
        buffer: {type: String},
        size: {type: String}}))
    buffer: Buffer;
    @Prop()
    size: number;


    constructor(encoding: string, mimetype: string, buffer: Buffer, size: number) {
        this.encoding = encoding;
        this.mimetype = mimetype;
        this.buffer = buffer;
        this.size = size;
    }

}

@Schema()
class Adresse {
    @Prop()
    street: string;
    @Prop()
    postal_code: number;
    @Prop()
    city: string;
    @Prop()
    country_code: string
}

@Schema()
class Seller {
    name: string;
    @Prop()
    tax_number: string;
    @Prop()
    tax_exemption: true;
    @Prop()
    tax_exemption_note: string;
    @Prop([Adresse])
    address: Adresse;
}
@Schema()
class Buyer {
    @Prop()
    customer_number: string;
    @Prop()
    name: string;
    @Prop()
    tax_number: string;
    @Prop([Adresse])
    address: Adresse;
}
@Schema()
class Head {
    @Prop()
    id: string;
    @Prop()
    number: string;
    @Prop({type: Date})
    date: Date;
    @Prop({type: Date})
    delivery_period_start: Date;
    @Prop({type: Date})
    delivery_period_end: Date;
    @Prop([Seller])
    seller: Seller
    @Prop()
    buyer_text: string;
    @Prop([Buyer])
    buyer: Buyer
}

@Schema()
class TSE {
    @Prop()
    serial_number: string
    @Prop()
    signature_algorithm: string
    @Prop()
    log_time_format: string
    @Prop()
    certificate: string
    @Prop({type: Date})
    timestamp_start:Date;
    @Prop({type: Date})
    timestamp_end: Date;
    @Prop({type: Date})
    first_order: Date
    @Prop()
    transaction_number: number;
    @Prop()
    signature_number: number;
    @Prop()
    process_type: string;
    @Prop()
    process_data: string;
    @Prop()
    signature: string;
}
@Schema()
class Security {
    @Prop([TSE])
    tse: TSE;
}
@Schema()
class PaymentType {
    @Prop()
    name: string;
    @Prop()
    amount: number;
    @Prop()
    foreign_amount: number;
    @Prop()
    foreign_currency: string;
}
@Schema()
class Mehrwertsteuer {
    @Prop()
    percentage: number;
    @Prop()
    incl_vat: number;
    @Prop()
    excl_vat: number;
    @Prop()
    vat: number;
}
@Schema()
class ProductItem {
    @Prop()
    number: string
    @Prop()
    gtin: string
    @Prop()
    quantity: number;
    @Prop()
    quantity_measure: string;
    @Prop()
    price_per_unit: number;
}
@Schema()
class Product {
    @Prop()
    text: string;
    @Prop()
    additional_text: string;
    @Prop([[Mehrwertsteuer]])
    vat_amounts: Mehrwertsteuer[];
    @Prop()
    item: ProductItem
    @Prop({type: Date})
    delivery_period_start: Date;
    @Prop({type: Date})
    delivery_period_end: Date;

}
@Schema()
class BelegDaten {
    @Prop()
    currency: string;
    @Prop()
    full_amount_incl_vat: number;
    @Prop([[PaymentType]])
    payment_types: PaymentType[];
    @Prop([[Mehrwertsteuer]])
    vat_amounts: Mehrwertsteuer[];
    @Prop()
    lines: Product[];

}
@Schema()
class Hypermedia {
    @Prop()
    content_type: string;
    @Prop()
    content: string;
}
@Schema()
class AdditionalContent {
    @Prop([Hypermedia])
    logo: Hypermedia;
    @Prop()
    footer_text: string;
    @Prop([[Hypermedia]])
    additional_receipts: Hypermedia[];

}
@Schema()
export class CashRegister {
    @Prop()
    serial_number:  string;
}
@Schema()
export class DocketContent {
    @Prop()
    version:  string;
    @Prop()
    type: string;
    @Prop([CashRegister])
    cash_register: CashRegister;

    @Prop([Head])
    head: Head;

    @Prop([BelegDaten])
    data: BelegDaten;

    @Prop([Security])
    security: Security;

    @Prop([AdditionalContent])
    misc: AdditionalContent;

}



export class CreateDocketDto {
    @ApiProperty()
    readonly receiverId: string;


    constructor(receiverId: string) {
        this.receiverId = receiverId;
    }
}



@Schema()
export class Docket {

    @Prop()
    tags: string[];
    @Prop({type: Date})
    createdAt: Date;
    @Prop()
    receiverId: string;
    @Prop()
    senderId: string;

    @Prop([DocketFile])
    docketFile: DocketFile;

    @Prop([DocketContent])
    docketContent: DocketContent;

    _id: string;


    getTags() {
        return this.tags;
    }

    addTag(tagId: string) {
        if (this.tags.includes(tagId)) {
            return;
        } else {
            this.tags.push(tagId)

        }
    }

    removeTag(tagId: string) {
        const index = this.tags.indexOf(tagId, 0)
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }

    constructor(docketDocument: DocketDocument) {
        this.tags = docketDocument.tags;
        this.createdAt = docketDocument.createdAt;
        this.receiverId = docketDocument.receiverId;
        this.senderId = docketDocument.senderId;
        this.docketFile = docketDocument.docketFile;
        this._id = docketDocument._id;
    }

}


export const DocketSchema = SchemaFactory.createForClass(Docket);
export type  DocketDocument = Docket & Document;
