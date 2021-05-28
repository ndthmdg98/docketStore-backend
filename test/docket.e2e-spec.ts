import * as request from 'supertest';
import {Test, TestingModule} from '@nestjs/testing';
import {HttpModule, INestApplication, ValidationPipe} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {APP_DI_CONFIG, DATABASE_URL_TEST} from "../src/app.module";
import {AuthModule,} from "../src/auth/auth.module";
import {MongoClient} from "mongodb";
import {DocketModule} from "../src/api/docket/docket.module";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
import * as fs from "fs";
import {
    codeGeneratorServiceMock,
    createAppUserDto,
    createB2BUserDto,
    loginAppDto,
    loginB2BDto, mailServiceMock,
    registerCodeMock
} from "../src/utils/mocks/auth.mocks";
import {MailService} from "../src/common/mail.service";
import {CodeGeneratorService} from "../src/auth/code-generator.service";

describe('Docket API endpoints testing (e2e)', () => {
    let createdAppUserId = "";
    let createdB2bUserId = "";
    let appJwtToken = "";
    let b2bJwtToken = "";
    let app: INestApplication;
    let connection;
    let db;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
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
        }).overrideProvider(MailService)
            .useValue(mailServiceMock)
            .overrideProvider(CodeGeneratorService)
            .useValue(codeGeneratorServiceMock).compile()

        connection = await MongoClient.connect("mongodb://localhost", {
            useNewUrlParser: true,
        });
        db = await connection.db("docketstore_test");
        await db.dropDatabase()

        app = moduleFixture.createNestApplication();
        app.enableShutdownHooks();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        await createAndActivateUsers();


    });

    it(`should login app user`, async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginAppDto)
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.statusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                appJwtToken = body.data.accessToken;
            });
    });



    it(`should import a docket to the authorized (app) user`, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + appJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)
            })

    });


    it(`should return all imported docket of a authorized  user`, async () => {
        return request(app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + appJwtToken)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.success).toBeTruthy()
                expect(response.data.length).toBe(1)
                expect(response.statusCode).toBe(200)
            });
    });

    it(`should import a docket to a authorized user`, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + appJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)
            })

    });

    it(`should not import a docket to a authorized user (app user, but no file)`, async () => {


        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + appJwtToken)
            .expect(400)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeFalsy()
                expect(response.statusCode).toBe(400)
            })

    });

    it(`should return all imported docket of authorized user`, async () => {
        return request(app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + appJwtToken)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.success).toBeTruthy()
                expect(response.data.length).toBe(2)
                expect(response.statusCode).toBe(200)
            });
    });


    it(`should login b2b user`, async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginB2BDto)
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.statusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                b2bJwtToken = body.data.accessToken;
            });
    });

    it(`should create a docket from the authorized (b2b) user to a given (app) user `, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")
        const createDocketUrl = '/docket/create/' + createdAppUserId;
        return request(app.getHttpServer())
            .post(createDocketUrl)
            .set('Authorization', 'bearer ' + b2bJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)
            })

    });

    it(`should not import a docket to the authorized (b2b) user `, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + b2bJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(403)
            .then(res => {
                const response = res.body;
                expect(response.error).toBe("Forbidden")
                expect(response.statusCode).toBe(403)
            })

    });

    afterAll(async () => {
        await app.close();
    });

    const createAndActivateUsers = async function () {
        //register app user
        await request(app.getHttpServer())
            .post('/auth/app/register')
            .send(createAppUserDto)
            .expect(200)
            .then(res => {
                const response = res.body;
                createdAppUserId = response.data;
            })
        const verifyAppAccountUrl = '/auth/' + createdAppUserId + "/" + registerCodeMock;
        await request(app.getHttpServer())
            .post(verifyAppAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBeNull();
                expect(body.statusCode).toBe(200);
            })
        //register b2b user
        await request(app.getHttpServer())
            .post('/auth/b2b/register')
            .send(createB2BUserDto)
            .expect(200)
            .then(res => {
                const response = res.body;
                createdB2bUserId = response.data;
            })
        const verifyB2bAccountUrl = '/auth/' + createdB2bUserId + "/" + registerCodeMock;
        await request(app.getHttpServer())
            .post(verifyB2bAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBeNull();
                expect(body.statusCode).toBe(200);
            })


    }

});
