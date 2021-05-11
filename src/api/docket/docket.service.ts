import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../../model/user.schema";
import {Model} from "mongoose";
import {DocketDocument} from "../../model/docket.schema";
import {Companyies} from "./interfaces";

export interface IDocketService {
    create(sender: UserDocument, receiver: UserDocument, fileName: string): Promise<DocketDocument>;

    updateById(docketId: string, valuesToChange: object): Promise<DocketDocument>;

    findAllByUser(user: User): Promise<DocketDocument[]>;

    findById(docketId: string): Promise<DocketDocument>;
}


@Injectable()
export class DocketService implements IDocketService {
    readonly baseDir = '/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend';

    constructor(@InjectModel('Dockets') private  docketModel: Model<DocketDocument>,
    ) {

    }

    async findById(docketId: string): Promise<DocketDocument | null> {
        return await this.docketModel.findById(docketId).exec();
    }

    async findAllByUser(user: UserDocument): Promise<DocketDocument[]> {
        return await this.docketModel.find({receiver: user}).exec();
    }

    async updateById(docketId: string, valuesToChange: object): Promise<DocketDocument> {
        return await this.docketModel.findByIdAndUpdate(docketId, valuesToChange).exec();
    }

    async create(receiver: UserDocument, sender: UserDocument, docketBlob: Blob): Promise<DocketDocument> {
        const createdDocketDocument = new this.docketModel({
            createdAt: new Date(),
            filePath: filePath,
            receiver: receiver,
            sender: sender,
            tags: [],
            docketContent: null
        });
        return createdDocketDocument.save();
    }


    extract(str: string) {
        // Date Regex Matcher
        if (str.match(/\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*/g)) {

        }
        // Company Matcher
        else if (str.includes(Companyies.DM_DROGERIE_MARKT || Companyies.REWE || Companyies.ALDI ||Companyies.LIDL)) {

        }
        // Summe Matcher
        else if (str.includes("SUMME" || "Zwischensumme" || "Betrag" || "Zu zahlen")) {

        }
        // Kartenzahlung oder Bar Matcher
        else if (str.includes("Kartenzahlung" || "KARTENZAHLUNG" || "BAR")) {

        }
    }
}
