export interface JwtPayloadInterface {
    id: string
    username: string;
    firstName: string;
    lastName: string;
}

export class APIResponse {
    success: boolean;
    data: any;
    statusCode: number;

    static errorResponse(httpStatusCode: number, message?: string): APIResponse {
            return new APIResponse(false, httpStatusCode, message)
    }

    static successResponse(data?: any): APIResponse {
        return new APIResponse(true, 200, data);
    }

    private constructor(success: boolean, statusCode: number, data: any) {
        this.success = success;
        this.data = data;
        this.statusCode = statusCode;
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
