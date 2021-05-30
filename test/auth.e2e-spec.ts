import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import registerCodeMock, {
    createAppUserDto,
    createB2BUserDto,
    createB2BUserErrorDto, falseLoginDto1, falseLoginDto2, falseLoginDto3,
    loginAppDto,
    loginB2BDto
} from "../src/utils/mocks/auth.mocks";
import {TestHelper} from "../src/utils/TestHelper";

describe('Auth API endpoints testing (e2e)', () => {

    let createdAppUserId: string = "";
    let createdB2BUserId: string = "";
    let appJwtToken: string = "";
    let b2bJwtToken: string = "";

    let testHelper: TestHelper;
    beforeAll(async () => {
        testHelper = new TestHelper("docketstore_test_auth");
        await testHelper.createTestingModule();
        await testHelper.dropTestDatabase();
    });


    it(`should register app user`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/app/register')
            .send(createAppUserDto)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)
                createdAppUserId = response.data;
            })

    });

    it(`should register b2b user`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/b2b/register')
            .send(createB2BUserDto)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)
                createdB2BUserId = response.data;
            })

    });
    it(`should not register b2b user (no valid dto)`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/b2b/register')
            .send(createB2BUserErrorDto)
            .expect(400)
            .then(res => {
                const response = res.body;
                expect(response.message.length).toBeGreaterThanOrEqual(1)
                expect(response.error).toBe("Bad Request")
            })

    });
    it(`should activate app user`, () => {
        const verifyAccountUrl = '/auth/' + createdAppUserId + "/" + registerCodeMock;
        return request(testHelper.app.getHttpServer())
            .get(verifyAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBe("Mail confirmed! Account successfully activated.");
                expect(body.statusCode).toBe(200);
            })

    });
    it(`should activate b2b user`, () => {
        const verifyAccountUrl = '/auth/' + createdB2BUserId + "/" + registerCodeMock;
        return request(testHelper.app.getHttpServer())
            .get(verifyAccountUrl)
            .send()
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.data).toBe("Mail confirmed! Account successfully activated.");
                expect(body.statusCode).toBe(200);
            })

    });


    it(`should login app user`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/login')
            .send(loginAppDto)
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.statusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                appJwtToken = body.data.accessToken;
            })
    });

    it(`should login b2b user`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/login')
            .send(loginB2BDto)
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body.success).toBeTruthy();
                expect(body.statusCode).toBe(200);
                expect(body.data.accessToken.length).toBeGreaterThan(50);
                b2bJwtToken = body.data.accessToken;
            })
    });


    it(`should not login a user`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/login')
            .send(falseLoginDto1)
            .expect(401)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeUndefined()
                expect(response.success).toBeFalsy()
                expect(response.statusCode).toBe(401)
            })
    });

    it(`should not login a user, too (no valid loginCredentials)`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/login')
            .send(falseLoginDto2)
            .expect(401)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeUndefined()
                expect(response.success).toBeFalsy()
                expect(response.statusCode).toBe(401)
            })
    });

    it(`should not login a user, too (no valid loginCredentials)`, () => {

        return request(testHelper.app.getHttpServer())
            .post('/auth/login')
            .send(falseLoginDto3)
            .expect(401)
            .then(res => {
                const response = res.body;
                expect(response.data).toBeUndefined()
                expect(response.success).toBeFalsy()
                expect(response.statusCode).toBe(401)
            })
    });

    it(`should get app profile`, () => {

        return request(testHelper.app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', 'bearer ' + appJwtToken)
            .expect(200)
            .then(res => {
                const response = res.body;

                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)

                const user = response.data;
                expect(user._id).toBeDefined()
                expect(user.firstName).toBeDefined()
                expect(user.firstName.length).toBeGreaterThanOrEqual(2)
                expect(user.lastName).toBeDefined()
                expect(user.lastName.length).toBeGreaterThanOrEqual(2)
                expect(user.username).toContain("@")
                expect(user.username).toContain(".")
                expect(user.username.length).toBeGreaterThanOrEqual(6)

                expect(user.email).toContain("@")
                expect(user.email).toContain(".")
                expect(user.email.length).toBeGreaterThanOrEqual(6)

                expect(user.company).toBeUndefined()
            })
    });


    it(`should not get app profile (no auth token)`, () => {

        return request(testHelper.app.getHttpServer())
            .get('/auth/profile')
            .expect(401)
            .then(res => {
                const response = res.body;
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(401);
                expect(response.message).toBe("Unauthorized");
            })
    });

    it(`should get b2b profile`, () => {

        return request(testHelper.app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', 'bearer ' + b2bJwtToken)
            .expect(200)
            .then(res => {
                const response = res.body;

                expect(response.data).toBeDefined()
                expect(response.success).toBeTruthy()
                expect(response.statusCode).toBe(200)

                const user = response.data;
                expect(user._id).toBeDefined()
                expect(user.firstName).toBeDefined()
                expect(user.firstName.length).toBeGreaterThanOrEqual(2)
                expect(user.lastName).toBeDefined()
                expect(user.lastName.length).toBeGreaterThanOrEqual(2)
                expect(user.username).toContain("@")
                expect(user.username).toContain(".")
                expect(user.username.length).toBeGreaterThanOrEqual(6)

                expect(user.email).toContain("@")
                expect(user.email).toContain(".")
                expect(user.email.length).toBeGreaterThanOrEqual(6)

                expect(user.company).not.toBeNull()
                expect(user.company.ustid).toBeDefined()
                expect(user.company.companyName).toBeDefined()
                expect(user.company.category).toBeDefined()
                expect(user.company.adresse).toBeDefined()
                expect(user.company.adresse.street.length).toBeGreaterThanOrEqual(2)
                expect(user.company.adresse.zipcode.length).toBeGreaterThanOrEqual(2)
                expect(user.company.adresse.country.length).toBeGreaterThanOrEqual(2)
                expect(user.company.adresse.housenumber).toBeDefined()
            })
    });


    afterAll(async () => {
        await testHelper.app.close();
    });
});

