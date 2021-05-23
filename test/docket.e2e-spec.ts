import * as request from 'supertest';
import {Test, TestingModule} from '@nestjs/testing';
import {ExecutionContext, HttpModule, INestApplication, ValidationPipe} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {APP_DI_CONFIG, AppModule, DATABASE_URL, DATABASE_URL_TEST} from "../src/app.module";
import {CreateAppUserDto, CreateB2BUserDto} from "../src/model/user.schema";
import {MailVerificationService} from "../src/auth/mail-verification.service";
import {AuthModule, } from "../src/auth/auth.module";
import {MongoClient} from "mongodb";
import {DocketModule} from "../src/api/docket/docket.module";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
import {UserService} from "../src/auth/user.service";
import * as fs from "fs";
import {createAppUserDto, createB2BUserDto, loginAppDto, loginB2BDto} from "../src/utils/mocks/auth.mocks";

describe('Docket API endpoints testing (e2e)', () => {

    const createAndActivateUsers = async function () {
        //register user
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(createAppUserDto)
            .expect(200)
        const userService = app.get(UserService)
        const appUser = await userService.findByUsername(createAppUserDto.username)
        expect(appUser).toBeDefined()
        const appUserActivationSucces = await userService.activateUser(appUser._id)
        expect(appUserActivationSucces).toBeTruthy()

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(createAppUserDto)
            .expect(200)
        const b2bUser = await userService.findByUsername(createB2BUserDto.username)
        expect(b2bUser).toBeDefined()
        const success = await userService.activateUser(b2bUser._id)
        expect(success).toBeTruthy()

    }
    let token = "";
    let app: INestApplication;
    let connection;
    let db;
    let registerCode = "123456789"
    let mailService = {
        sendWelcomeEmail: () => Promise.resolve(true),
        create: () => Promise.resolve({code: registerCode}),
    };


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
        }).overrideProvider(MailVerificationService).useValue(mailService).compile()

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
                expect(body.httpStatusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                token = body.data.accessToken;
            });
    });

    it(`should import a docket to the authorized (app) user`, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + token)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.httpStatusCode).toBe(200)
            })

    });




    it(`should return all imported docket of a authorized  user`, async () => {
        return request(app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.success).toBeTruthy()
                expect(response.data.length).toBe(1)
                expect(response.httpStatusCode).toBe(200)
            });
    });

    it(`should import a docket to a authorized user`, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + token)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.httpStatusCode).toBe(200)
            })

    });

    it(`should return all imported docket of authorized user`, async () => {
        return request(app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.success).toBeTruthy()
                expect(response.data.length).toBe(2)
                expect(response.httpStatusCode).toBe(200)
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
                expect(body.httpStatusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                token = body.data.accessToken;
            });
    });

    it(`should not import a docket to the authorized (b2b) user `, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        return request(app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + token)
            .attach('file', file, 'file.pdf')
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeNull()
                expect(response.success).toBeFalsy()
                expect(response.httpStatusCode).toBe(401)
            })

    });

    afterAll(async () => {
        await app.close();
    });
});
