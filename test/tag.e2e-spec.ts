import {TestHelper} from "../src/utils/TestHelper";

describe('Tag API endpoints testing (e2e)', () => {

    let tagId;
    const tagName = "Archiv"
    const renamedTagName = "Archiv"

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




    it(`should create an tag correctly`, async () => {

        const body = await testHelper.createTag("Archiv");
        tagId = body.data;

        expect(body.statusCode).toBe(200)
        expect(body.data.length).toBeGreaterThanOrEqual(10)
        expect(body.success).toBeTruthy()

        const getTagBody = await testHelper.getTag(tagId);
        expect(getTagBody.statusCode).toBe(200)
        expect(getTagBody.success).toBeTruthy()
        expect(getTagBody.data.userId).toBe(testHelper.appUserId)
        expect(getTagBody.data._id).toBe(tagId)
        expect(getTagBody.data.tagName).toBe(tagName)

    });

    it(`should not create an tag (empty tag Name)`, async () => {
        const body = await testHelper.createTag("");
        expect(body.statusCode).toBe(400)
        expect(body.data).toBeUndefined()
        expect(body.success).toBeFalsy()

    });

    it(`should rename an tag`, async () => {
        const body = await testHelper.renameTag(tagId, renamedTagName);
        expect(body.statusCode).toBe(200)
        expect(body.data).toBeUndefined()
        expect(body.success).toBeTruthy()

        const getTagBody = await testHelper.getTag(tagId);
        expect(getTagBody.statusCode).toBe(200)
        expect(getTagBody.success).toBeTruthy()
        expect(getTagBody.data.userId).toBe(testHelper.appUserId)
        expect(getTagBody.data._id).toBe(tagId)
        expect(getTagBody.data.tagName).toBe(renamedTagName)

    });

    it(`should return all tags of a user`, async () => {
        const body = await testHelper.getAllTagsByUser();

        expect(body.statusCode).toBe(200)
        expect(body.success).toBeTruthy()
        expect(body.data).toBeDefined()
        const tags = body.data;

        expect(tags.length).toBe(1)
        expect(tags[0]._id).toBe(tagId)

    });


    it(`should delete a tag`, async () => {
        const body = await testHelper.deleteTag(tagId);

        expect(body.statusCode).toBe(200)
        expect(body.success).toBeTruthy()
        expect(body.data).toBeUndefined()

        const getTagBody = await testHelper.getTag(tagId);
        expect(getTagBody.statusCode).toBe(404)
        expect(getTagBody.success).toBeFalsy()
        expect(getTagBody.data).toBeUndefined()

    });


    afterAll(async () => {
        await testHelper.app.close();
    });


});
