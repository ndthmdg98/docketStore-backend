import {HttpService, Injectable} from '@nestjs/common';
import {Docket} from "../../../../model/docket.schema";
import {ExternalAPI, ExternalAPIAccount, IToken} from "../../../../model/external-api-account.schema";
import {generators, Issuer} from "openid-client";

const puppeteer = require('puppeteer');
const iPhone = (puppeteer.devices)['iPhone 8'];
const urlparse = require('url');
const req = require('request');
import * as btoa from 'btoa';
@Injectable()
export class ReweApiService implements ExternalAPI {

    baseUrl: string
    fetchUrl: string;
    loginUrl: string = "https://shop.rewe.de/mydata/login"

    constructor(private httpService: HttpService) {
    }


    async authenticate(email: string, password?: string): Promise<string> {

        Issuer.discover("https://shop.rewe.de")
            .then(function (openidIssuer) {
                const nonce = generators.nonce();
                const code_verifier = generators.codeVerifier();
                const code_challenge = generators.codeChallenge(code_verifier);


                (async () => {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.emulate(iPhone);
                    await page.goto("https://shop.rewe.de/mydata/login");
                    await new Promise(r => setTimeout(r, 1500));
                    await page.click('[name="username"]', {waitUntil: 'networkidle0'});
                    await page.keyboard.type(email, {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 1500));
                    await page.click('[name="password"]', {waitUntil: 'networkidle0'});
                    await page.keyboard.type(password, {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 1500));


                    page.on('request', request => {
                        console.log(request._url)
                        request.continue().catch((err) => {
                        });
                    });

                    console.log("submit...");
                    const response = await page.click('#login_button', {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 15000));
                    await browser.close();
                })();
            });
        return "";
    }

    async fetchDockets(externalAPIAccount: ExternalAPIAccount): Promise<any[]> {
        const email = externalAPIAccount.email;
        const password = btoa(externalAPIAccount.password);
        const token = await this.authenticate(email, password);
        if (token) {

        }
        return []
    }

    transformDocket(object: any): Promise<Docket> {
        return Promise.resolve(undefined);
    }


}
