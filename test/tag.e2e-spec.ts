import * as request from 'supertest';
import {TestHelper} from "../src/utils/TestHelper";
import createTagDto from "../src/utils/mocks/tag.mocks";

describe('Tag API endpoints testing (e2e)', () => {

    let tagId;
    let testHelper: TestHelper;
    beforeAll(async () => {
        testHelper = new TestHelper();
        await testHelper.createTestingModule();
        await testHelper.dropTestDatabase();
        await testHelper.createAndActivateAppUser();
        await testHelper.createAndActivateB2BUser();
        await testHelper.loginAppUser();
        await testHelper.loginB2BUser();
    });





    it(`should create an tag`, async () => {

        const res = await request(testHelper.app.getHttpServer())
            .post('tag')
            .set('Authorization', 'bearer' + testHelper.appJwtToken)
            .send(createTagDto)
            .expect(200)
        const response = res.body;
        expect(response.data).toBeDefined()
        expect(response.success).toBeTruthy()
        expect(response.statusCode).toBe(200)
        tagId = response.data;

    });


    afterAll(async () => {
        await testHelper.app.close();
    });


});
