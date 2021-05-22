
export const Mocks = {
    mockRequest: () => {
        const req = {
            body: undefined,
            params: undefined
        }
        req.body = jest.fn().mockReturnValue(req)
        req.params = jest.fn().mockReturnValue(req)
        return req
    },

    mockResponse: () => {
        const response = {
            json: (body?: any) => { },
            send: (body?: any) => { },
            status: (code: number) => response,
        };
        return response
    },
    // mockNext: () => jest.fn()
}
