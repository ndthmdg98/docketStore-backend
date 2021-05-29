import {Test, TestingModule} from "@nestjs/testing";
import {MongooseModule} from "@nestjs/mongoose";
import {APP_DI_CONFIG, DATABASE_URL_TEST} from "../app.module";
import {DocketModule} from "../api/docket/docket.module";
import {AuthModule} from "../auth/auth.module";
import {HttpModule, INestApplication, ValidationPipe} from "@nestjs/common";
import {AppController} from "../app.controller";
import {AppService} from "../app.service";
import {MailService} from "../common/mail.service";
import registerCodeMock, {
    codeGeneratorServiceMock,
    createAppUserDto,
    createB2BUserDto, loginAppDto, loginB2BDto,
    mailServiceMock,
} from "./mocks/auth.mocks";
import {CodeGeneratorService} from "../auth/code-generator.service";
import {MongoClient} from "mongodb";
import * as request from "supertest";
import createTagDto from "./mocks/tag.mocks";

export class TestHelper {
    private _B2bUserId;
    private _appUserId;
    private _tagId;
    private _appJwtToken;
    private _b2bJwtToken;
    private _docketId;
    private _app;

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
                MongooseModule.forRoot(DATABASE_URL_TEST),
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
        db = await connection.db("docketstore_test");
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
                expect(body.data).toBeNull();
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
                expect(body.data).toBeNull();
                expect(body.statusCode).toBe(200);
            })


    }

    async createTag(): Promise<void> {

        const res = await request(this.app.getHttpServer())
            .post('/tag')
            .set('Authorization', 'bearer ' + this.appJwtToken)
            .send(createTagDto)
            .expect(200)
        const response = res.body;
        this._tagId = response.data;

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


}
