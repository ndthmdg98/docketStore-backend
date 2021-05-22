import {HttpService, Injectable} from '@nestjs/common';
import {ExternalAPI, ExternalAPIAccount} from "../../../../model/external-api-account.schema";
import {Docket} from "../../../../model/docket.schema";
import {IToken} from "../../../../interfaces";

@Injectable()
export class DmApiService implements ExternalAPI {

    baseUrl = "http://dm.api.de";
    fetchUrl: string;
    loginUrl: string;

    constructor(private httpService: HttpService) {
    }


    async authenticate(email: string, password: string): Promise<string> {
        const token: IToken = {accessToken: ""}
        //TODO authentication
        return ""
    }

    async fetchDockets(externalAPIAccount: ExternalAPIAccount): Promise<Docket[]> {
        const decryptedPassword = atob(externalAPIAccount.password);
        const email = externalAPIAccount.email
        const token = this.authenticate(email, decryptedPassword)
        const result = this.httpService.get(this.baseUrl, {})
        return []
    }

    transformDocket(object: any): Promise<Docket> {
        return Promise.resolve(undefined);
    }




}
