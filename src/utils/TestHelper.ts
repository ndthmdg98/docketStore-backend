import {Test} from "@nestjs/testing";
import {MongooseModule} from "@nestjs/mongoose";
import {APP_DI_CONFIG, DATABASE_URL_TEST} from "../app.module";
import {DocketModule} from "../api/docket/docket.module";
import {AuthModule} from "../auth/auth.module";
import {HttpModule, ValidationPipe} from "@nestjs/common";
import {AppController} from "../app.controller";
import {AppService} from "../app.service";
import {MailService} from "../common/mail.service";
import registerCodeMock, {
    codeGeneratorServiceMock,
    createAppUserDto,
    createB2BUserDto,
    loginAppDto,
    loginB2BDto,
    mailServiceMock,
} from "./mocks/auth.mocks";
import {CodeGeneratorService} from "../auth/code-generator.service";
import {MongoClient} from "mongodb";
import * as request from "supertest";
import {CreateTagDto, RenameTagDto} from "../dto/tag.dto";

export class TestHelper {
    private _B2bUserId;
    private _appUserId;
    private _tagId;
    private _appJwtToken;
    private _b2bJwtToken;
    private _docketId;
    private _app;
    private _databaseUrl;
    private _databaseName;
    constructor(databaseName: string) {
        this._databaseUrl = "mongodb://localhost/" + databaseName;
        this._databaseName =  databaseName;
    }

    get app() {
        return this._app;
    }

    get B2bUserId() {
        return this._B2bUserId;
    }

    get appUserId() {
        return this._appUserId;
    }

    get tagId() {
        return this._tagId;
    }

    get appJwtToken() {
        return this._appJwtToken;
    }

    get b2bJwtToken() {
        return this._b2bJwtToken;
    }

    get docketId() {
        return this._docketId;
    }

    async createTestingModule() {
        const moduleFixture = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(this._databaseUrl),
                DocketModule,
                AuthModule,
                HttpModule
            ],
            controllers: [AppController],
            providers: [AppService,
                {
                    provide: 'APP_CONFIG',
                    useValue: APP_DI_CONFIG
                },

            ],
        })
            .overrideProvider(MailService)
            .useValue(mailServiceMock)
            .overrideProvider(CodeGeneratorService)
            .useValue(codeGeneratorServiceMock).compile()
        this._app = moduleFixture.createNestApplication();
        this._app.enableShutdownHooks();

        this._app.useGlobalPipes(new ValidationPipe());
        await this._app.init();
    }

    async dropTestDatabase(): Promise<void> {
        let connection;
        let db;
        connection = await MongoClient.connect("mongodb://localhost", {
            useNewUrlParser: true,
        });
        db = await connection.db(this._databaseName);
        await db.dropDatabase()
    }

    async createAndActivateAppUser(): Promise<void> {
        const res = await request(this.app.getHttpServer())
            .post('/auth/app/register')
            .send(createAppUserDto)
            .expect(200)
        const response = res.body;
        this._appUserId = response.data;
        const verifyAppAccountUrl = '/auth/' + this._appUserId + "/" + registerCodeMock;
        await request(this.app.getHttpServer())
            .get(verifyAppAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBe("Mail confirmed! Account successfully activated.");
                expect(body.statusCode).toBe(200);
            })
    }

    async createAndActivateB2BUser(): Promise<void> {
        //register b2b user
        await request(this.app.getHttpServer())
            .post('/auth/b2b/register')
            .send(createB2BUserDto)
            .expect(200)
            .then(res => {
                const response = res.body;
                this._B2bUserId = response.data;
            })
        const verifyB2bAccountUrl = '/auth/' + this._B2bUserId + "/" + registerCodeMock;
        await request(this.app.getHttpServer())
            .get(verifyB2bAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBe("Mail confirmed! Account successfully activated.");
                expect(body.statusCode).toBe(200);
            })


    }
    async getAppUser() {
        const url = '/auth/profile'
        const res = await request(this.app.getHttpServer())
            .get(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body
    }
    async getB2BUser() {
        const url = '/auth/profile'
        const res = await request(this.app.getHttpServer())
            .get(url)
            .set('Authorization', 'bearer ' + this.b2bJwtToken)
            .send()
        return res.body
    }

    async createTag(tagName: string): Promise<any> {

        const res = await request(this.app.getHttpServer())
            .post('/tag')
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send(new CreateTagDto(tagName))
        return res.body

    }

    async loginAppUser(): Promise<void> {
        const res = await request(this.app.getHttpServer())
            .post('/auth/login')
            .send(loginAppDto)
        this._appJwtToken = res.body.data.accessToken;

    }

    async loginB2BUser(): Promise<void> {
        const res = await request(this.app.getHttpServer())
            .post('/auth/login')
            .send(loginB2BDto)
        this._b2bJwtToken = res.body.data.accessToken;

    }




    async getTag(tagId: string) {
        const url = '/tag/' + tagId;
        const res = await request(this.app.getHttpServer())
            .get(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body
    }

    async renameTag(tagId: string, newTagName: string) {
        const url = '/tag/' + tagId;
        const res = await request(this.app.getHttpServer())
            .put(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send(new RenameTagDto(newTagName))
        return res.body
    }

    async getAllTagsByUser() {
        const url = '/tag';
        const res = await request(this.app.getHttpServer())
            .get(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body

    }

    async deleteTag(tagId) {
        const url = '/tag/' + tagId;
        const res = await request(this.app.getHttpServer())
            .delete(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body
    }

    async deleteDocket(docketId: string) {
        const url = '/docket/' + docketId;
        const res = await request(this.app.getHttpServer())
            .delete(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body
    }

    async getDocket(docketId: string) {
        const url = '/docket/' + docketId;
        const res = await request(this.app.getHttpServer())
            .get(url)
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send()
        return res.body
    }
}
