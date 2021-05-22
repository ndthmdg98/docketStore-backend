export interface JwtPayloadInterface {
    id: string
    username: string;
    firstName: string;
    lastName: string;
}

export class APIResponse {
    success: boolean;
    data: any;
    httpStatusCode: number;

    static errorResponse(httpStatusCode: number): APIResponse {
            return new APIResponse(false, httpStatusCode, null)
    }

    static successResponse(data?: any): APIResponse {
        return new APIResponse(true, 200, data);
    }

    private constructor(success: boolean, httpStatusCode: number, data: any) {
        this.success = success;
        this.data = data;
        this.httpStatusCode = httpStatusCode;
    }
    stringify(){
        return JSON.stringify(this);
    }
}


export interface IToken {
    accessToken: string;
    expiresIn?: number;
    refreshToken?: string;
}
