import * as request from 'supertest';
import * as fs from "fs";
import {TestHelper} from "../src/utils/TestHelper";

describe('Docket API endpoints testing (e2e)', () => {
    let testHelper: TestHelper;
    let docketId = "";
    let tagId = ""
    //TODO path passt evtl nicht
    const file = fs.readFileSync("./files/Dein REWE eBon vom 15.04.2021.pdf")
    beforeAll(async () => {
        testHelper = new TestHelper("docketstore_test_docket");
        await testHelper.createTestingModule();
        await testHelper.dropTestDatabase();
        await testHelper.createAndActivateAppUser();
        await testHelper.createAndActivateB2BUser();
        await testHelper.loginAppUser();
        await testHelper.loginB2BUser();
        const body = await testHelper.createTag("Archiv")
        tagId = body.data

    });


    it(`should import a docket to the authorized (app) user`, async () => {

        const file = fs.readFileSync("files/Dein REWE eBon vom 15.04.2021.pdf")
        const res = await request(testHelper.app.getHttpServer())
            .post('/docket/import/')
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)

        const response = res.body;
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)
        expect(response.data).toBeDefined()
        docketId = response.data

    });


    it(`should return all imported docket of a authorized  user`, () => {
        return request(testHelper.app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .expect(200)
            .then(res => {
                const response = res.body;
                expect(response.success).toBeTruthy()
                expect(response.data.length).toBe(1)
                expect(response.statusCode).toBe(200)
            });
    });

    it(`should import a docket to a authorized user`, async () => {



        const res = await request(testHelper.app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)

        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)
        docketId = response.data

    });


    it(`should mark a docket with a tag`, async () => {

        const docketUrl = '/docket/' + docketId + '/mark/' + tagId
        const res = await request(testHelper.app.getHttpServer())
            .put(docketUrl)
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)

    });

    it(`should return a docket in json with a tag`, async () => {

        const docketUrl = '/docket/' + docketId
        const res = await request(testHelper.app.getHttpServer())
            .get(docketUrl)
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .set('Accept', 'application/json')
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)
        const docket = response.data;
        expect(docket.tags.length).toBe(1)

    });

    it(`should unmark a docket with a tag`, async () => {

        const docketUrl = '/docket/' + docketId + '/unmark/' + tagId
        const res = await request(testHelper.app.getHttpServer())
            .put(docketUrl)
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)

    });

    it(`should return a docket in json with zero tags`, async () => {

        const docketUrl = '/docket/' + docketId
        const res = await request(testHelper.app.getHttpServer())
            .get(docketUrl)
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .set('Accept', 'application/json')
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)
        const docket = response.data;
        expect(docket.tags.length).toBe(0)

    });





    it(`should not import a docket to a authorized user (app user, but no file)`, async () => {


        const res = await request(testHelper.app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .expect(400)
        const response = res.body;
        expect(response.data).toBeUndefined()
        expect(response.success).toBeFalsy()
        expect(response.statusCode).toBe(400)

    });

    it(`should return all imported docket of authorized user`, async () => {
        const res = await request(testHelper.app.getHttpServer())
            .get('/docket/')
            .set('Authorization', 'bearer ' + testHelper.appJwtToken)
            .expect(200)
        const response = res.body;
        expect(response.success).toBeTruthy()
        expect(response.data.length).toBe(2)
        expect(response.statusCode).toBe(200)
    });


    it(`should create a docket from the authorized (b2b) user to a given (app) user `, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")
        const createDocketUrl = '/docket/create/' + testHelper.appUserId;
        const res = await request(testHelper.app.getHttpServer())
            .post(createDocketUrl)
            .set('Authorization', 'bearer ' + testHelper.b2bJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)

    });

    it(`should not import a docket to the authorized (b2b) user `, async () => {

        const file = fs.readFileSync("/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/test/files/Dein REWE eBon vom 15.04.2021.pdf")

        const res = await request(testHelper.app.getHttpServer())
            .post('/docket/import')
            .set('Authorization', 'bearer ' + testHelper.b2bJwtToken)
            .attach('file', file, 'file.pdf')
            .expect(403)
        const response = res.body;
        expect(response.error).toBe("Forbidden")
        expect(response.statusCode).toBe(403)

    });

    it(`should delete a docket`, async () => {
        const body = await testHelper.deleteDocket(docketId)
        expect(body.statusCode).toBe(200)
        expect(body.success).toBeTruthy()
        expect(body.data).toBeUndefined()
        const getTagBody = await testHelper.getDocket(docketId);
        expect(getTagBody.statusCode).toBe(404)
        expect(getTagBody.success).toBeFalsy()
        expect(getTagBody.data).toBeUndefined()

    });

    afterAll(async () => {
        await testHelper.app.close();
    });


});
