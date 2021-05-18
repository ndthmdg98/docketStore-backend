
export interface JwtPayloadInterface {
    id: string
    username: string;
    firstName: string;
    lastName: string;
}

export interface IResponse {
    status: number;
    data: any;
    success: boolean;
}
