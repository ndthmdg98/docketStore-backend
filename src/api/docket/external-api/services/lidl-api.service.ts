import {HttpService, Injectable} from '@nestjs/common';
import {ExternalAPI, ExternalAPIAccount, IToken} from "../../../../model/external-api-account.schema";
import {Docket} from "../../../../model/docket.schema";
import * as btoa from 'btoa';

const {Issuer, generators} = require('openid-client');
const puppeteer = require('puppeteer');
const iPhone = (puppeteer.devices)['iPhone 8'];
const urlparse = require('url');
const req = require('request');

@Injectable()
export class LidlApiService implements ExternalAPI {
    baseUrl: string = "https://accounts.lidl.com";
    fetchUrl: string = "https://appgateway.lidlplus.com/app/v19/DE/tickets";
    loginUrl: string = "https://accounts.lidl.com/connect/token"


    constructor(private httpService: HttpService) {
    }


    async authenticate(email: string, password: string): Promise<string> {
        let login_country = 'DE';
        let login_language = 'DE-DE';
        let token: IToken = null;
        console.log(email)
        console.log(password)

        Issuer.discover('https://accounts.lidl.com')
            .then(function (openidIssuer) {
                const nonce = generators.nonce();
                const code_verifier = generators.codeVerifier();
                const code_challenge = generators.codeChallenge(code_verifier);

                const client = new openidIssuer.Client({
                    client_id: 'LidlPlusNativeClient',
                    redirect_uris: ['com.lidlplus.app://callback'],
                    response_types: ['code']
                });

                const loginurl = client.authorizationUrl({
                    scope: 'openid profile offline_access lpprofile lpapis',
                    code_challenge,
                    code_challenge_method: 'S256',
                    nonce: nonce
                });
                console.log('In case your refresh_token cannot be retrieved open this url once in your browser and accept the terms and conditions of the given country:\n');
                console.log(loginurl + '&Country=' + login_country + '&language=' + login_language);

                (async () => {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.emulate(iPhone);
                    await page.goto(loginurl + '&Country=' + login_country + '&language=' + login_language);
                    await new Promise(r => setTimeout(r, 1500));
                    await page.click('#button_welcome_login', {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 1500));
                    await page.click('[name="EmailOrPhone"]', {waitUntil: 'networkidle0'});
                    await page.keyboard.type(email, {waitUntil: 'networkidle0'});
                    await page.click('#button_btn_submit_email', {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 1500));
                    await page.click('[name="Password"]', {waitUntil: 'networkidle0'});
                    await page.keyboard.type(password, {waitUntil: 'networkidle0'});
                    await new Promise(r => setTimeout(r, 1500));

                    page.on('response', response  => {
                        if (response._url.includes('com.lidlplus.app://callback')) {
                            console.log(response._url)
                        }
                    });
                    page.on('request', request => {
                        if (request._url.includes('com.lidlplus.app')) {
                                var url_parts = urlparse.parse(request._url, true);
                                console.log('Query:\n', url_parts.query);
                                var query = url_parts.query;
                                console.log('query:\n', query);

                                var tokenurl = 'https://accounts.lidl.com/connect/token';
                                var headers = {
                                    'Authorization': 'Basic TGlkbFBsdXNOYXRpdmVDbGllbnQ6c2VjcmV0',
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                };
                                var form = {
                                    grant_type: 'authorization_code',
                                    code: query.code,
                                    redirect_uri: 'com.lidlplus.app://callback',
                                    code_verifier: code_verifier
                                };

                                req.post({
                                    url: tokenurl,
                                    form: form,
                                    headers: headers,
                                    json: true
                                }, function (e, r, body) {
                                    console.log('BODY:\n', body, '\n');
                                    console.log('Access token:\n', body.access_token, '\n');
                                    console.log('Refresh token:\n', body.refresh_token);
                                });
                        } else {
                        }
                        request.continue().catch((err) => {
                        });
                    });

                    console.log("submit...");
                    const response = await page.click('#button_submit', {waitUntil: 'networkidle0'});
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
            this.httpService.get(this.fetchUrl, {
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded",
                    'App-Version': '999.99.9',
                    'Operating-System': 'macOS',
                    'App': 'com.lidl.eci.lidl.plus',
                    'Accept': '*/*',
                    'CountryV1Model': "DE",
                    'Authorization': 'Bearer ' + token
                }
            }).subscribe(res => {
                console.log(res.data);
            });
            this.transformDocket({});
            return Promise.resolve([]);
        }


    }

    transformDocket(object: any): Promise<Docket> {
        return Promise.resolve(undefined);
    }


}
