import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {DmApiService} from "./services/dm-api.service";
import {LidlApiService} from "./services/lidl-api.service";
import {ReweApiService} from "./services/rewe-api.service";
import {
    CreateExternalAPIAccountDto,
    ExternalAPIAccount,
    ExternalAPIAccountDocument, implementedExternalAPIs,
} from "../../../model/external-api-account.schema";
import {Docket} from "../../../model/docket.schema";

import * as atob from "atob";

@Injectable()
export class ExternalApiService {

    constructor(
        @InjectModel('ExternalAPIAccounts') private  externalAPIAccountModel: Model<ExternalAPIAccountDocument>,
        private dmAPIService: DmApiService,
        private lidlAPIService: LidlApiService,
        private reweAPIService: ReweApiService
    ) {

    }

    async storeNewExternalAPIAccount(userId: string, newExternalAPIAccount: CreateExternalAPIAccountDto): Promise<ExternalAPIAccountDocument> {
        const createdExternalAPIAccount = new this.externalAPIAccountModel({
            createdAt: new Date(),
            userId: userId,
            email: newExternalAPIAccount.email,
            password: atob(newExternalAPIAccount.password),
            externalAPI: newExternalAPIAccount.externalAPI
        });
        return createdExternalAPIAccount.save();
    }

    async fetchDocketsFromAllExternalAPIAccountsOfaUser(userId: string): Promise<any[]> {
        const externalAPIAccounts = await this.findAllExternalAPIAccountsByUserId(userId);
        let dockets = [];
        for (const externalAPIAccount of externalAPIAccounts) {
            const docketsOfExternalAPI = await this.fetchDocketsFromExternalAPI(externalAPIAccount);

        }
        return dockets
    }

    async fetchDocketsFromExternalAPI(externalAPIAccount: ExternalAPIAccount): Promise<Docket[]> {
        switch (externalAPIAccount.externalAPI) {
            case 1: {
                return await this.dmAPIService.fetchDockets(externalAPIAccount);
                break;
            }
            case 2: {
                //return await this.lidlAPIService.fetchDockets(externalAPIAccount);
                break;
            }
            case 3: {
                return await this.reweAPIService.fetchDockets(externalAPIAccount);
                break;
            }
            default: {
                return null;
                break;
            }
        }

    }


    async findAllExternalAPIAccountsByUserId(userId: string): Promise<ExternalAPIAccountDocument[]> {
        return await this.externalAPIAccountModel.find({userId: userId}).exec();
    }

    async changePasswordOfExternalAPIAccount(externalAPIAccountId: string, newPassword: string): Promise<ExternalAPIAccountDocument> {
        const valuesToChange = {password: btoa(newPassword)};
        return await this.updateById(externalAPIAccountId, valuesToChange);
    }

    private async updateById(externalAPIAccountId: string, valuesToChange: object): Promise<ExternalAPIAccountDocument> {
        return await this.externalAPIAccountModel.findByIdAndUpdate(externalAPIAccountId, valuesToChange).exec();
    }

    async deleteExternalAPIAccount(externalAPIAccountId: string) {
        return await this.externalAPIAccountModel.findByIdAndDelete(externalAPIAccountId).exec();
    }
}
